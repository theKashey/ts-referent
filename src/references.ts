import { join } from 'path';

import type { PackageJSON } from './package-interface';
import type { Kind } from './types';
import { valueOrFactoryFold } from './utils/factory';
import { writeJSON } from './utils/fs';
import { relativeToLocal } from './utils/paths';
import { mapReference, PackageMap } from './utils/workspace';

export const getConfigLocation = (root: string, packageName: string) =>
  join(root, '.referenced', packageName.replace('/', '-'));

export const defineReference = (
  configLocation: string,
  kindName: string,
  kind: Kind,
  isolationMode: boolean,
  packageDir: string,
  packageJson: PackageJSON,
  packageMap: PackageMap
) => {
  const location = join(configLocation, 'config');
  const output =
    valueOrFactoryFold(
      kind.outputDirectory,
      (dir) => join(packageDir, dir),
      (fn) => fn(packageJson, packageDir)
    ) ??
    join(
      valueOrFactoryFold(
        kind.outDirRoot,
        (dir) => join(packageDir, dir),
        (fn) => fn(packageJson, packageDir)
      ) ?? configLocation,
      'output',
      kindName
    );
  const configurationLocation = kind.isolatedInDirectory ? join(packageDir, kind.isolatedInDirectory) : packageDir;
  const focusOn = kind.isolatedInDirectory || kind.focusOnDirectory;
  const directoryLocation = focusOn ? join(packageDir, focusOn) : packageDir;

  const useDependencies = kind.useDependencies ?? true;
  const useDevDependencies = kind.useDevDependencies ?? true;

  const defaultEntry = isolationMode ? `tsconfig.public.json` : `tsconfig.json`;

  const config = {
    extends: relativeToLocal(location, kind.extends || join(configurationLocation, 'tsconfig.json')),
    include: [
      ...kind.include.map((i) => `${relativeToLocal(location, configurationLocation)}/${i}`),
      ...(kind.import?.map((i) => relativeToLocal(location, i)) ?? []),
    ],
    exclude: [
      ...(kind.exclude?.map((i) => `${relativeToLocal(location, configurationLocation)}/${i}`) ?? []),
      ...(kind.ignore?.map((i) => relativeToLocal(location, i)) ?? []),
    ],
    references: [
      ...mapReference(
        useDependencies ? packageJson.dependencies : undefined,
        location,
        packageMap,
        defaultEntry,
        kind.relationMapper
      ),
      ...mapReference(
        useDevDependencies ? packageJson.devDependencies : undefined,
        location,
        packageMap,
        defaultEntry,
        kind.relationMapper
      ),
      ...(kind.references || []).map((kindName) => ({ path: `tsconfig.${kindName}.json` })),
      ...(kind.externals || []).map((path) => ({ path: relativeToLocal(location, path) })),
    ],
    files: kind.files,
    compilerOptions: {
      composite: true,
      ...kind.compilerOptions,
      noEmit: false,
      outDir: relativeToLocal(location, output),
      rootDir: relativeToLocal(location, directoryLocation),
      baseUrl: relativeToLocal(location, directoryLocation),
      tsBuildInfoFile: relativeToLocal(location, join(configLocation, '.cache', kindName)),
      types: kind.types,
    },
  };
  const configFile = join(location, `tsconfig.${kindName}.json`);
  writeJSON(configFile, config);

  return configFile;
};
