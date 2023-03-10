import type { ConfigurationFile } from './types';

export type { Kind, KindsConfigurationSet as Kinds, EntrypointResolver } from './types';
export type { PackageJSON } from './package-interface';
export { alter } from './alter';

/**
 * a helper to provide configuration as one single whole
 * @param options
 */
export const configure = (options: ConfigurationFile): ConfigurationFile => {
  return options;
};
