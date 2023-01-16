import { generateGlossaryLookup } from '../glossary';

describe('glossary', () => {
  test('normal mode', () => {
    expect(generateGlossaryLookup(['x/packages/a', 'x/packages/b'], 'x')).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "composite": true,
        },
        "files": Array [],
        "references": Array [
          Object {
            "path": "./packages/a/tsconfig.json",
          },
          Object {
            "path": "./packages/b/tsconfig.json",
          },
        ],
      }
    `);
  });
});
