import { join } from 'path';

import { PackageJSON } from './package-interface';
import { defineReference } from './references';
import { Kind, KindSet, ResolvedConfiguration } from './types';
import { relativeToLocal } from './utils/paths';
import { PackageMap } from './utils/workspace';

export const defineLocalConfig = (
  { kinds, paths, ...conf }: Readonly<ResolvedConfiguration>,
  baseConfig: string,
  packageDir: string,
  configLocation: string,
  packageJson: PackageJSON,
  packageMap: PackageMap
): Record<string, any> | undefined => {
  if (!conf.baseConfig) {
    throw new Error(
      'base `baseConfig` is not defined for ' + packageDir + '. Configuration files used: ' + paths.join(',')
    );
  }

  if (!kinds || Object.keys(kinds).length === 0) {
    return undefined;
  }

  return {
    extends: relativeToLocal(packageDir, baseConfig),
    include: [],
    exclude: [],
    references: Object.entries(kinds)
      .filter(([, kind]) => Boolean(kind))
      .map(([kindName, kind]) => ({
        path: relativeToLocal(
          packageDir,
          defineReference(
            configLocation,
            kindName,
            kind!,
            conf.isolatedMode || false,
            packageDir,
            packageJson,
            packageMap
          )
        ),
      })),
    compilerOptions: {
      composite: true,
      baseUrl: '.',
      types: [],
      noEmit: false,
      tsBuildInfoFile: relativeToLocal(packageDir, join(configLocation, '.cache', 'main-reference')),
      ...conf.compilerOptions,
    },
  };
};

type PackageTypeRoot = ReturnType<typeof defineLocalConfig>;

const kindsFilter = (kinds: KindSet, filter: (name: string, kind: Kind) => boolean): KindSet =>
  Object.fromEntries(Object.entries(kinds).filter((kind) => filter(...kind)));

export const definePackageConfig = (
  { kinds, ...config }: Readonly<ResolvedConfiguration>,
  packageDir: string,
  configLocation: string,
  packageJson: PackageJSON,
  packageMap: PackageMap,
  folderExists: (folder: string) => boolean
): Record<string, PackageTypeRoot | undefined> => {
  if (!config.baseConfig) {
    throw new Error(
      'base `baseConfig` is not defined for ' + packageDir + '. Configuration files used: ' + config.paths.join(',')
    );
  }

  if (!kinds || Object.keys(kinds).length === 0) {
    throw new Error(
      'kinds configuration is missing for ' + packageDir + '. Configuration files used: ' + config.paths.join(',')
    );
  }

  const isolatedPackages = kindsFilter(kinds, (_, kind) => Boolean(kind.isolatedInDirectory));
  const privatePackages = kindsFilter(kinds, (name, kind) => !isolatedPackages[name] && Boolean(kind.internal));
  const createdIsolatedPackages: KindSet = {};

  const constellation: Record<string, PackageTypeRoot> = {};
  const localRootConfig = join(packageDir, 'tsconfig.json');

  Object.entries(isolatedPackages).forEach(([name, kind]) => {
    if (folderExists(kind.isolatedInDirectory!)) {
      createdIsolatedPackages[name] = kind;

      constellation[join(kind.isolatedInDirectory!, 'tsconfig.json')] = defineLocalConfig(
        { kinds: { [name]: kind }, ...config },
        localRootConfig,
        join(packageDir, kind.isolatedInDirectory!),
        configLocation,
        packageJson,
        packageMap
      );
    }
  });

  const publicPackages = kindsFilter(
    kinds,
    (name, kind) =>
      // not used before
      (!isolatedPackages[name] && !privatePackages[name]) ||
      // explicit includes
      (createdIsolatedPackages[name] && kind.internal === false)
  );

  if (config.isolatedMode) {
    constellation['tsconfig.public.json'] = defineLocalConfig(
      { kinds: publicPackages, ...config },
      localRootConfig,
      packageDir,
      configLocation,
      packageJson,
      packageMap
    );
  } else {
    if (Object.keys(privatePackages).length > 0) {
      throw new Error('internal packages require `isolatedMode` to be enabled');
    }
  }

  constellation['tsconfig.json'] = defineLocalConfig(
    {
      kinds: {
        ...publicPackages,
        ...privatePackages,
        ...createdIsolatedPackages,
      },
      ...config,
    },
    config.baseConfig,
    packageDir,
    configLocation,
    packageJson,
    packageMap
  );

  return constellation;
};
