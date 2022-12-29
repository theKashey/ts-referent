import { dirname, join } from 'path';

import { KindMap, KindSet } from './types';

export const requireConfigurationFile = (filename: string): KindSet => {
  try {
    // check file existence. Return empty array if file does not exists
    require.resolve(filename);
  } catch (e) {
    return {};
  }

  return require(filename);
};

const loadData = (location: string): KindSet => {
  if (!location) {
    return {};
  }

  return requireConfigurationFile(join(location, '.ts-referent'));
};

const cachedLookup = (top: string, location: string, cache: KindMap, rowCache: KindSet) => {
  if (location === '/' || !location.includes(top)) {
    return;
  }

  if (cache.has(location)) {
    return;
  }

  const kinds = loadData(location);
  cache.set(location, kinds);

  //validation
  Object.keys(kinds).forEach((kind) => {
    if (rowCache.hasOwnProperty(kind)) {
      throw new Error('duplicate kind found - ' + kind);
    }
  });

  cachedLookup(top, dirname(location), cache, { ...rowCache, ...kinds });
};

export const readRulesFromFileSystem = (top: string, edges: string[]): KindMap => {
  const cache: KindMap = new Map();

  edges.forEach((edge) => cachedLookup(top, edge, cache, {}));

  return cache;
};
