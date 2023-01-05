export type { Kind, KindsConfigurationSet as Kinds, EntrypointResolver } from './types';
import type { ConfigurationFile } from './types';

export const configure = (options: ConfigurationFile): ConfigurationFile => {
  return options;
};
