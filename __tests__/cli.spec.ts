import { mocked } from 'ts-jest/utils';

import { PackageJSON } from '../src';
import { program } from '../src/cli';
import { getKindsCache } from '../src/kinds';
import { writeJSON } from '../src/utils/fs';
import { getVersion } from '../src/utils/get-version';
import { getRoot, getWorkspace } from '../src/utils/workspace';

jest.mock('../src/utils/workspace');
jest.mock('../src/utils/fs');
jest.mock('../src/utils/get-version');

jest.mock('../src/kinds', () => ({
  ...jest.requireActual('../src/kinds'),
  getKindsCache: jest.fn(),
}));

describe('cli', function () {
  mocked(getVersion).mockReturnValue(10);
  mocked(getRoot).mockReturnValue('/user1/');

  mocked(getWorkspace).mockReturnValue(
    Promise.resolve([
      {
        dir: '/user1/package1',
        packageJson: { name: 'package1', main: 'index.ts' } as PackageJSON,
      },
      {
        dir: '/user1/package2',
        packageJson: { name: 'package2', main: 'main.ts' } as PackageJSON,
      },
    ])
  );

  mocked(getKindsCache).mockReturnValue([['/user1', {}]]);

  it('generate paths', async () => {
    const trap = new Promise<[string, any]>((resolve) =>
      mocked(writeJSON).mockImplementation((filename, payload) => resolve([filename, payload]))
    );
    program.parse(['node', 'test', 'paths', 'tsconfig.paths.json']);

    expect(await trap).toMatchInlineSnapshot(`
      Array [
        "tsconfig.paths.json",
        Object {
          "compilerOptions": Object {
            "paths": Object {
              "package1": Array [
                "/user1/package1/index.ts",
              ],
              "package2": Array [
                "/user1/package2/main.ts",
              ],
            },
          },
        },
      ]
    `);
  });

  it('generate paths and extending another config', async () => {
    const trap = new Promise<[string, any]>((resolve) =>
      mocked(writeJSON).mockImplementation((filename, payload) => resolve([filename, payload]))
    );
    program.parse(['node', 'test', 'paths', '--extends', 'parent.json', 'tsconfig.paths.json']);

    expect((await trap)[1].extends).toBe('parent.json');
  });
});
