import { alter } from '../alter';
import { filterKinds } from '../kinds';

describe('alternation', () => {
  it('extends', () => {
    const altered = alter({
      base: {
        include: ['a'],
        useDependencies: true,
        files: ['c'],
      },
    }).kinds({ base: { include: ['b'], types: ['d'] } as any, extra: {} as any }, {} as any);
    expect(altered.base.include).toEqual(['b', 'a']);

    expect(altered).toMatchInlineSnapshot(`
      Object {
        "base": Object {
          "compilerOptions": Object {},
          "exclude": Array [],
          "externals": Array [],
          "files": Array [
            "c",
          ],
          "ignore": Array [],
          "import": Array [],
          "include": Array [
            "b",
            "a",
          ],
          "references": Array [],
          "types": Array [
            "d",
          ],
          "useDependencies": true,
        },
        "extra": Object {
          "compilerOptions": Object {},
          "exclude": Array [],
          "externals": Array [],
          "files": Array [],
          "ignore": Array [],
          "import": Array [],
          "include": Array [],
          "references": Array [],
          "types": Array [],
        },
      }
    `);
  });

  it('reduces via null', () => {
    expect(
      Object.keys(
        filterKinds(
          alter({
            keepThis: {},
            removeThis: null,
          }).kinds({ keepThis: {} as any, removeThis: {} as any }, {} as any)
        )
      )
    ).toEqual(['keepThis']);
  });

  it('reduces via options', () => {
    expect(
      Object.keys(
        filterKinds(
          alter(
            {
              keepThis: {},
            },
            { disableUnmatchedKinds: true }
          ).kinds(
            {
              keepThis: {} as any,
              removeThis: {} as any,
            },
            {} as any
          )
        )
      )
    ).toEqual(['keepThis']);
  });

  it('throws on undefined', () => {
    expect(() => alter({ newOne: {} }).kinds({ properOne: {} as any }, {} as any)).toThrowError();
  });

  it('adds new one of told explicitly', () => {
    expect(alter({ newOne: { expectExtension: false, include: [] } }).kinds({ properOne: {} as any }, {} as any))
      .toMatchInlineSnapshot(`
      Object {
        "newOne": Object {
          "compilerOptions": Object {},
          "exclude": Array [],
          "externals": Array [],
          "files": Array [],
          "ignore": Array [],
          "import": Array [],
          "include": Array [],
          "references": Array [],
          "types": Array [],
        },
        "properOne": Object {
          "compilerOptions": Object {},
          "exclude": Array [],
          "externals": Array [],
          "files": Array [],
          "ignore": Array [],
          "import": Array [],
          "include": Array [],
          "references": Array [],
          "types": Array [],
        },
      }
    `);
  });
});
