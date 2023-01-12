import { relative } from 'path';

export const relativeToLocal = (from: string, to: string): string => {
  const path = relative(from, to);

  return path[0] == '.' ? path : `./${path}`;
};
