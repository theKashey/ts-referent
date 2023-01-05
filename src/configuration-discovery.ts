import { dirname, join } from 'path';

import { ConfigurationFile, KindMap } from './types';
import { requireConfigurationFile } from './utils/require-indirection';

const EMPTY: ConfigurationFile = {};

const loadData = (location: string): ConfigurationFile => {
  if (!location) {
    return EMPTY;
  }

  return requireConfigurationFile(join(location, 'tsconfig.referent')) || EMPTY;
};

const cachedLookup = (top: string, location: string, cache: KindMap) => {
  if (location === '/' || !location.includes(top)) {
    return;
  }

  if (cache.has(location)) {
    return;
  }

  const kinds = loadData(location);
  cache.set(location, kinds);

  cachedLookup(top, dirname(location), cache);
};

export const readRulesFromFileSystem = (top: string, edges: string[]): KindMap => {
  const cache: KindMap = new Map();

  edges.forEach((edge) => cachedLookup(top, edge, cache));

  return new Map(Array.from(cache.entries()).filter((entity) => entity[1] !== EMPTY));
};
