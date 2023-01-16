import { join } from 'path';

import { relativeToLocal } from './utils/paths';

export const generateGlossaryLookup = (directories: string[], targetDir: string, isolatedMode: boolean) => {
  const tail = isolatedMode ? 'tsconfig.public.json' : 'tsconfig.json';

  return {
    files: [],
    compilerOptions: {
      composite: true,
    },
    references: directories.map((dir) => ({ path: relativeToLocal(targetDir, join(dir, tail)) })),
  };
};
