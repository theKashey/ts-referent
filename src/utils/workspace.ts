import { join } from 'path';

import { findRootSync } from '@manypkg/find-root';
import { getPackages } from '@manypkg/get-packages';

import { Package } from '../package-interface';
import { RelationMapper } from '../types';
import { relativeToLocal } from './paths';

export const getRoot = (): string => {
  try {
    return findRootSync(process.cwd());
  } catch (e) {
    throw new Error('no monorepo has been detected');
  }
};

export const getWorkspace = async (root: string): Promise<Package[]> => {
  try {
    return (await getPackages(root)).packages;
  } catch (e) {
    throw new Error('no monorepo has been detected');
  }
};

export type PackageMap = Record<string, Package>;

const directMapper: RelationMapper = (defaultPath) => [defaultPath];

export const mapReference = (
  deps: Record<string, string> | undefined,
  root: string,
  packageMap: PackageMap,
  defaultEntry: string,
  mapper: RelationMapper = directMapper
) => {
  const localPackages = Object.keys(deps || [])
    .map((dep) => packageMap[dep])
    .filter(Boolean);

  return localPackages
    .flatMap((pkg) => mapper(defaultEntry, pkg.packageJson, pkg.dir).map((subPath) => join(pkg.dir, subPath)))
    .map((location) => ({ path: relativeToLocal(root, location) }));
};
