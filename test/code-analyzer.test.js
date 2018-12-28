import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {

    it('Test 1', () => {
        assert.equal(
            parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n', '1, 2, 3'),
            'n1 [label="1\n' +
            'let a = x + 1;" ,shape="box" ,color="green" , style=filled]\n' +
            'n2 [label="2\n' +
            'let b = a + y;" ,shape="box" ,color="green" , style=filled]\n' +
            'n3 [label="3\n' +
            'let c = 0;" ,shape="box" ,color="green" , style=filled]\n' +
            'n4 [label="4\n' +
            'b < z" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n5 [label="5\n' +
            'c = c + 5" ,shape="box"]\n' +
            'n6 [label="6\n' +
            'return c;" ,shape="box" ,color="green" , style=filled]\n' +
            'n7 [label="7\n' +
            'b < z * 2" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n8 [label="8\n' +
            'c = c + x + 5" ,shape="box" ,color="green" , style=filled]\n' +
            'n9 [label="9\n' +
            'c = c + z + 5" ,shape="box"]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n7 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n9 [label="false"]\n' +
            'n8 -> n6 []\n' +
            'n9 -> n6 []'
        );
    });

    it('Test 2', () => {
        assert.equal(
            parseCode('let a = [1,2,3];\n' +
                'function foo (x){\n' +
                '   let q = a[1];\n' +
                '   if(q === 1){\n' +
                '      return 1;\n' +
                '   }\n' +
                '   else if(q === 2){\n' +
                '      return a[2];\n' +
                '   }\n' +
                '   return a\n' +
                '}', '1'),
            'n1 [label="1\n' +
            'let q = a[1];" ,shape="box" ,color="green" , style=filled]\n' +
            'n2 [label="2\n' +
            'q === 1" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n3 [label="3\n' +
            'return 1;" ,shape="box"]\n' +
            'n4 [label="4\n' +
            'q === 2" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n5 [label="5\n' +
            'return a[2];" ,shape="box" ,color="green" , style=filled]\n' +
            'n6 [label="6\n' +
            'return a" ,shape="box"]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n6 [label="false"]'
        );
    });

    it('Test 3', () => {
        assert.equal(
            parseCode('let t = [true];\n' +
                'let f = [false];\n' +
                'function goo (){\n' +
                '   let q = 0;\n' +
                '   while(f[0]){\n' +
                '      q++;\n' +
                '   }\n' +
                '   return t[0];\n' +
                '}', ''),
            'n1 [label="1\n' +
            'let q = 0;" ,shape="box" ,color="green" , style=filled]\n' +
            'n2 [label="2\n' +
            'f[0]" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n3 [label="3\n' +
            'q++" ,shape="box"]\n' +
            'n4 [label="4\n' +
            'return t[0];" ,shape="box" ,color="green" , style=filled]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]\n' +
            'n3 -> n2 []'
        );
    });

    // it('Test 4', () => {
    //     assert.equal(
    //         parseCode('function foo(x, y, z){\n' +
    //             '    let a = x + 1;\n' +
    //             '    let b = a + y;\n' +
    //             '    let c = 0;\n' +
    //             '    \n' +
    //             '    while (a < z) {\n' +
    //             '        c = a + b;\n' +
    //             '        z = c * 2;\n' +
    //             '    }\n' +
    //             '    \n' +
    //             '    return z;\n' +
    //             '}\n', '(x=1,y=2,z=3)'),
    //         'function foo(x, y, z) {\n' +
    //         '    while (x + 1 < z) {\n' +
    //         '        z = (x + 1 + x + 1 + y) * 2;\n' +
    //         '    }\n' +
    //         '    return z;\n' +
    //         '}'
    //     );
    // });
    //
    // it('Test 5', () => {
    //     assert.equal(
    //         parseCode('function f(x,y){\n' +
    //             ' let a = 1;\n' +
    //             ' x = y;\n' +
    //             ' if(x > 1){\n' +
    //             '  a = 7;}\n' +
    //             ' else{\n' +
    //             '  a = y;}\n' +
    //             ' return a;\n' +
    //             '}', '(x=1,y=2)'),
    //         'function f(x, y) {\n' +
    //         '    x = y;\n' +
    //         '<highlight_green>    if (x > 1) {</highlight_green>\n' +
    //         '    } else {\n' +
    //         '    }\n' +
    //         '    return 7;\n' +
    //         '}'
    //     );
    // });
    //
    // it('Test 6', () => {
    //     assert.equal(
    //         parseCode('function foo(x, y, z){\n' +
    //             ' let a = 1;\n' +
    //             ' z[0] = 4;\n' +
    //             ' if(x == 1){\n' +
    //             '  a = 3;\n' +
    //             ' }\n' +
    //             ' else{\n' +
    //             '  a = 2;\n' +
    //             ' }\n' +
    //             '    return z + a;\n' +
    //             '}', '(x=1,y=2,z=3)'),
    //         'function foo(x, y, z) {\n' +
    //         '    z[0] = 4;\n' +
    //         '<highlight_green>    if (x == 1) {</highlight_green>\n' +
    //         '    } else {\n' +
    //         '    }\n' +
    //         '    return z + 3;\n' +
    //         '}'
    //     );
    // });
    //
    // it('Test 7', () => {
    //     assert.equal(
    //         parseCode('function foo(x, y, z){\n' +
    //             ' let a = 1;\n' +
    //             ' let arr = [1,2,3];\n' +
    //             ' let b = z[2];\n' +
    //             ' let c = a + 5 / 2 - 1 * 2;\n' +
    //             ' z[1] = 2;\n' +
    //             ' if (a == b){\n' +
    //             '    a = b;\n' +
    //             '    return b;\n' +
    //             ' }\n' +
    //             ' return a;\n' +
    //             '}', '(x=1,y=2,z=3)'),
    //         'function foo(x, y, z) {\n' +
    //         '    z[1] = 2;\n' +
    //         '<highlight_red>    if (1 == z[2]) {</highlight_red>\n' +
    //         '        return z[2];\n' +
    //         '    }\n' +
    //         '    return 1;\n' +
    //         '}'
    //     );
    // });
    //
    // it('Test 8', () => {
    //     assert.equal(
    //         parseCode('function foo(z){ \n' +
    //             '  z[1] = 2;\n' +
    //             '}', '(z=[1,2,3])'),
    //         'function foo(z) {\n' +
    //         '    z[1] = 2;\n' +
    //         '}'
    //     );
    // });
    //
    // it('Test 9', () => {
    //     assert.equal(
    //         parseCode('function foo(z){ \n' +
    //             '  let q = 1;\n' +
    //             '  if (z[1] === q){\n' +
    //             '     return 5;\n' +
    //             '  }\n' +
    //             '  return q;\n' +
    //             '}', '(z=[1,2,3])'),
    //         'function foo(z) {\n' +
    //         '<highlight_red>    if (z[1] === 1) {</highlight_red>\n' +
    //         '        return 5;\n' +
    //         '    }\n' +
    //         '    return 1;\n' +
    //         '}'
    //     );
    // });
    //
    // it('Test 10', () => {
    //     assert.equal(
    //         parseCode('function foo(z){ \n' +
    //             '  let q = 1;\n' +
    //             '  let a = b;\n' +
    //             '  if (z[0] === q){\n' +
    //             '     return 5;\n' +
    //             '  }\n' +
    //             '  return q;\n' +
    //             '}', '(z=[1,2,3])'),
    //         'function foo(z) {\n' +
    //         '<highlight_green>    if (z[0] === 1) {</highlight_green>\n' +
    //         '        return 5;\n' +
    //         '    }\n' +
    //         '    return 1;\n' +
    //         '}'
    //     );
    // });
});
