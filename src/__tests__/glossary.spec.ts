import { generateGlossaryLookup } from '../glossary';

describe('glossary', () => {
  test('normal mode', () => {
    expect(generateGlossaryLookup(['x/packages/a', 'x/packages/b'], 'x', false)).toMatchInlineSnapshot(`
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

  test('isolated mode', () => {
    expect(generateGlossaryLookup(['x/packages/a', 'x/packages/b'], 'x', true)).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "composite": true,
        },
        "files": Array [],
        "references": Array [
          Object {
            "path": "./packages/a/tsconfig.public.json",
          },
          Object {
            "path": "./packages/b/tsconfig.public.json",
          },
        ],
      }
    `);
  });
});
