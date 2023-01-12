import { definePackageConfig } from '../tsconfigs';
import { writeJSON } from '../utils/fs';

jest.mock('../utils/fs');

test('definePackageConfig throws on incomplete configuration', () => {
  expect(() =>
    definePackageConfig(
      {
        kinds: {},
        paths: ['file-1'],
        baseConfig: 'tsconfig.js',
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      {} as any,
      {}
    )
  ).toThrow();

  expect(() =>
    definePackageConfig(
      {
        kinds: { x: {} as any },
        paths: ['file-1'],
        baseConfig: undefined,
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      {} as any,
      {}
    )
  ).toThrow();
});

test('definePackageConfig output generation', () => {
  expect(
    definePackageConfig(
      {
        kinds: { x: { include: [], useDependencies: true } },
        paths: ['file-1'],
        baseConfig: '/user/x/tsconfig.js',
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      { dependencies: { y: '1', z: 2 } } as any,
      { y: '/user/package/y' }
    )
  ).toMatchInlineSnapshot(`
    Object {
      "compilerOptions": Object {
        "baseUrl": ".",
        "composite": true,
        "noEmit": false,
        "tsBuildInfoFile": ".reference/.cache/main-reference",
        "types": Array [],
      },
      "exclude": Array [],
      "extends": "./tsconfig.js",
      "include": Array [],
      "references": Array [
        Object {
          "path": ".reference/config/tsconfig.x.json",
        },
      ],
    }
  `);

  expect(writeJSON).toHaveBeenCalledWith('/user/x/.reference/config/tsconfig.x.json', {
    compilerOptions: {
      baseUrl: '../..',
      composite: true,
      noEmit: false,
      outDir: '../output/x',
      rootDir: '../..',
      tsBuildInfoFile: '../.cache/x',
      types: undefined,
    },
    exclude: [],
    extends: '../../tsconfig.json',
    files: undefined,
    include: [],
    references: [
      {
        path: '../../../package/y',
      },
    ],
  });
});
