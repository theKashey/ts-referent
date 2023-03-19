import { join } from 'path';

import { definePackageConfig } from '../tsconfigs';
import { Kind } from '../types';
import { writeJSON } from '../utils/fs';

jest.mock('../utils/fs');

beforeEach(() => jest.resetAllMocks());

describe('output dir generation', () => {
  const factoryPreset = (extra: Partial<Kind>) =>
    definePackageConfig(
      {
        kinds: { x: { include: ['**/*'], ...extra } },
        paths: ['file-1'],
        baseConfig: '/user/x/tsconfig.js',
        entrypointResolver: () => [],
      },
      '/user/x/package1',
      '/user/x/.reference',
      { dependencies: { y: '1', z: 2 } } as any,
      { y: { dir: '/user/package/y', packageJson: {} as any } },
      () => true
    );

  test('base', () => {
    factoryPreset({});

    expect(writeJSON).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        compilerOptions: expect.objectContaining({
          outDir: '../output/x',
        }),
      })
    );
  });

  test('base plain override', () => {
    factoryPreset({ outDirRoot: './outDir' });

    expect(writeJSON).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        compilerOptions: expect.objectContaining({
          outDir: '../../package1/outDir/output/x',
        }),
      })
    );
  });

  test('base function override', () => {
    factoryPreset({ outDirRoot: (_, dir) => join(dir, './outDir') });

    expect(writeJSON).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        compilerOptions: expect.objectContaining({
          outDir: '../../package1/outDir/output/x',
        }),
      })
    );
  });

  test('precise location', () => {
    factoryPreset({ outputDirectory: './outputDirectory', outDirRoot: './outDir' });

    expect(writeJSON).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        compilerOptions: expect.objectContaining({
          outDir: '../../package1/outputDirectory',
        }),
      })
    );
  });
});
