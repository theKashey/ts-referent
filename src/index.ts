import type { ConfigurationFile } from './types';

export type { Kind, KindsConfigurationSet as Kinds, EntrypointResolver } from './types';
export type { PackageJSON } from './package-interface';

export const configure = (options: ConfigurationFile): ConfigurationFile => {
  return options;
};
