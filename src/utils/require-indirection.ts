import { ConfigurationFile } from '../types';

export const requireConfigurationFile = (filename: string): ConfigurationFile | undefined => {
  try {
    // check file existence. Return empty array if file does not exists
    require.resolve(filename);
  } catch (e) {
    return undefined;
  }

  const config = require(filename);

  if (config && config.default) {
    if (Object.keys(config).length > 1) {
      throw new Error('ts-referent configuration should use or named exports, or a default one. You cannot mix them.');
    }

    return config.default;
  }

  return config;
};
