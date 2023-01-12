import { join } from 'path';

import type { PackageJSON } from './package-interface';
import type { Kind } from './types';
import { valueOrFactory } from './utils/factory';
import { writeJSON } from './utils/fs';
import { relativeToLocal } from './utils/paths';
import { mapReference, PackageMap } from './utils/workspace';

export const getConfigLocation = (root: string, packageName: string) =>
  join(root, '.referenced', packageName.replace('/', '-'));

export const defineReference = (
  configLocation: string,
  kindName: string,
  kind: Kind,
  packageDir: string,
  packageJson: PackageJSON,
  packageMap: PackageMap
) => {
  const location = join(configLocation, 'config');
  const output = join(valueOrFactory(kind.outDirRoot, packageJson, packageDir) ?? configLocation, 'output', kindName);

  const config = {
    extends: relativeToLocal(location, kind.extends || join(packageDir, 'tsconfig.json')),
    include: [
      ...kind.include.map((i) => `${relativeToLocal(location, packageDir)}/${i}`),
      ...(kind.import?.map((i) => relativeToLocal(location, i)) ?? []),
    ],
    exclude: [
      ...(kind.exclude?.map((i) => `${relativeToLocal(location, packageDir)}/${i}`) ?? []),
      ...(kind.ignore?.map((i) => relativeToLocal(location, i)) ?? []),
    ],
    references: [
      ...mapReference(kind.useDependencies ? packageJson.dependencies : undefined, location, packageMap),
      ...mapReference(kind.useDevDependencies ? packageJson.devDependencies : undefined, location, packageMap),
      ...(kind.references || []).map((kindName) => ({ path: `tsconfig.${kindName}.json` })),
      ...(kind.externals || []).map((path) => ({ path: relativeToLocal(location, path) })),
    ],
    files: kind.files,
    compilerOptions: {
      composite: true,
      ...kind.compilerOptions,
      noEmit: false,
      outDir: relativeToLocal(location, output),
      rootDir: relativeToLocal(location, packageDir),
      baseUrl: relativeToLocal(location, packageDir),
      tsBuildInfoFile: relativeToLocal(location, join(configLocation, '.cache', kindName)),
      types: kind.types,
    },
  };
  const configFile = join(location, `tsconfig.${kindName}.json`);
  writeJSON(configFile, config);

  return configFile;
};
