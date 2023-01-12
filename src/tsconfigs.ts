import { join } from 'path';

import { PackageJSON } from './package-interface';
import { defineReference } from './references';
import { ResolvedConfiguration } from './types';
import { relativeToLocal } from './utils/paths';
import { PackageMap } from './utils/workspace';

export const definePackageConfig = (
  { kinds, paths, ...conf }: Readonly<ResolvedConfiguration>,
  packageDir: string,
  configLocation: string,
  packageJson: PackageJSON,
  packageMap: PackageMap
) => {
  if (!conf.baseConfig) {
    throw new Error(
      'base `baseConfig` is not defined for ' + packageDir + '. Configuration files used: ' + paths.join(',')
    );
  }

  if (!kinds || Object.keys(kinds).length === 0) {
    throw new Error(
      'kinds configuration is missing for ' + packageDir + '. Configuration files used: ' + paths.join(',')
    );
  }

  return {
    extends: relativeToLocal(packageDir, conf.baseConfig),
    include: [],
    exclude: [],
    references: Object.keys(kinds).map((kind) => ({
      path: relativeToLocal(
        packageDir,
        defineReference(configLocation, kind, kinds[kind], packageDir, packageJson, packageMap)
      ),
    })),
    compilerOptions: {
      composite: true,
      baseUrl: '.',
      types: [],
      noEmit: false,
      tsBuildInfoFile: relativeToLocal(packageDir, join(configLocation, '.cache', 'main-reference')),
    },
  };
};
