import { readRulesFromFileSystem } from './configuration-discovery';
import type { Package } from './package-interface';
import type { KindCache, KindSet, ResolvedConfiguration } from './types';
import { valueOrFactory } from './utils/factory';

export const getKindsCache = (packages: Package[], root: string): KindCache => {
  return Array.from(
    readRulesFromFileSystem(
      root,
      packages.map((pkg) => pkg.dir)
    ).entries()
  ).sort((a, b) => a[0].length - b[0].length);
};

export const getKinds = (kindsCache: KindCache, dir: string, pkg: Package): Readonly<ResolvedConfiguration> => {
  const kinds: KindSet = {};
  const base: ResolvedConfiguration = {
    baseConfig: undefined,
    entrypointResolver: undefined,
    kinds: {},
    paths: [],
  };
  const paths: string[] = [];

  kindsCache.forEach(([path, file]) => {
    if (dir.includes(path)) {
      const { kinds: fileKinds, ...rest } = file;
      Object.assign(kinds, valueOrFactory(fileKinds, kinds, pkg));
      Object.assign(base, rest);
      paths.push(path);
    }
  });

  return { ...base, kinds, paths };
};
