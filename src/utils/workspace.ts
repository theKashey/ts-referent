import { relative } from 'path';

import { findRootSync } from '@manypkg/find-root';
import { getPackages } from '@manypkg/get-packages';

export const getRoot = (): string => {
  try {
    return findRootSync(process.cwd());
  } catch (e) {
    throw new Error('no monorepo has been detected');
  }
};

export const getWorkspace = async (root: string) => {
  try {
    return (await getPackages(root)).packages;
  } catch (e) {
    throw new Error('no monorepo has been detected');
  }
};

export type PackageMap = Record<string, string>;

export const mapReference = (deps: Record<string, string> | undefined, root: string, packageMap: PackageMap) =>
  Object.keys(deps || [])
    .map((dep) => packageMap[dep])
    .filter(Boolean)
    .map((location) => ({ path: relative(root, location) }));
