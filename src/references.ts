import { join, relative } from 'path';

import type { Package } from './package-interface';
import type { Kind } from './types';
import { valueOrFactory } from './utils/factory';
import { writeJSON } from './utils/fs';
import { mapReference, PackageMap } from './utils/workspace';

export const getConfigLocation = (root: string, packageName: string) =>
  join(root, '.referenced', packageName.replace('/', '-'));

export const defineReference = (
  configLocation: string,
  kindName: string,
  kind: Kind,
  pkg: Package,
  packageMap: PackageMap
) => {
  const location = join(configLocation, 'config');
  const output = join(valueOrFactory(kind.outDirRoot, pkg.packageJson, pkg.dir) ?? configLocation, 'output', kindName);

  const config = {
    extends: relative(location, kind.extends || join(pkg.dir, 'tsconfig.json')),
    include: [
      ...kind.include.map((i) => `${relative(location, pkg.dir)}/${i}`),
      ...(kind.import?.map((i) => relative(location, i)) ?? []),
    ],
    exclude: [
      ...(kind.exclude?.map((i) => `${relative(location, pkg.dir)}/${i}`) ?? []),
      ...(kind.ignore?.map((i) => relative(location, i)) ?? []),
    ],
    references: [
      ...mapReference(kind.useDependencies ? pkg.packageJson.dependencies : undefined, location, packageMap),
      ...mapReference(kind.useDevDependencies ? pkg.packageJson.devDependencies : undefined, location, packageMap),
      ...(kind.references || []).map((kindName) => ({ path: `tsconfig.${kindName}.json` })),
      ...(kind.externals || []).map((path) => ({ path: relative(location, path) })),
    ],
    files: kind.files,
    compilerOptions: {
      composite: true,
      ...kind.compilerOptions,
      noEmit: false,
      outDir: relative(location, output),
      rootDir: relative(location, pkg.dir),
      baseUrl: relative(location, pkg.dir),
      tsBuildInfoFile: relative(location, join(configLocation, '.cache', kindName)),
      types: kind.types,
    },
  };
  const configFile = join(location, `tsconfig.${kindName}.json`);
  writeJSON(configFile, config);

  return configFile;
};
