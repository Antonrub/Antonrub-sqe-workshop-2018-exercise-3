import assert from 'assert';
import {parseCode, paintAndShapeVertices, mapInputTypes, createInputTypes, cleanExceptionEntryExit} from '../src/js/code-analyzer';
import * as esgraph from 'esgraph';
import * as esprima from 'esprima';


describe('The javascript parser', () => {

    let types_array = ['AssignmentExpression', 'VariableDeclaration', 'BinaryExpression', 'ReturnExpression', 'Literal', 'Identifier', 'IfStatement', 'FunctionDeclaration', 'BlockStatement', 'WhileStatement'];
    let input_types1 = [];
    let mapped_input_types1 = new Map();

    for (let i = 0; i < 10; i++){
        input_types1[i] = [['n' + i],[types_array[i]]];
        mapped_input_types1.set('n' + i, types_array[i]);
    }

    let program1 = 'function foo(x, y, z){\n' +
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
        '}\n';
    let vertices_to_color_program1 = ['n1', 'n2', 'n3', 'n4', 'n7', 'n8', 'n6'];
    let vertices_types_program1 = [['n1', 'VariableDeclaration'],['n2', 'VariableDeclaration'],['n3', 'VariableDeclaration'],['n4', 'BinaryExpression'],['n5', 'AssignmentExpression'],['n6', 'ReturnStatement'],['n7', 'BinaryExpression'],['n8', 'AssignmentExpression'],['n9','AssignmentExpression']];
    let graphed_input_program1 = esgraph.dot(esgraph(esprima.parse(program1, { range: true }).body[esprima.parse(program1, { range: true }).body.length - 1].body), {counter:0, source: program1});
    let graphed_input_program1_no_exit_entry = cleanExceptionEntryExit(graphed_input_program1);
    let dot_program1 = esgraph.dot(esgraph(esprima.parse(program1, { range: true }).body[esprima.parse(program1, { range: true }).body.length - 1].body));

    it('Test 1: parseCode 1', () => {
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

    it('Test 2: parseCode 2', () => {
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

    it('Test 3: parseCode 3', () => {
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

    it('Test 4: paintAndShapeVertices', () => {
        assert.equal(
            paintAndShapeVertices(graphed_input_program1_no_exit_entry, vertices_to_color_program1, vertices_types_program1).toString(),
            [ 'n1 [label="1\nlet a = x + 1;" ,shape="box" ,color="green" , style=filled]',
                'n2 [label="2\nlet b = a + y;" ,shape="box" ,color="green" , style=filled]',
                'n3 [label="3\nlet c = 0;" ,shape="box" ,color="green" , style=filled]',
                'n4 [label="4\nb < z" ,shape="diamond" ,color="green" , style=filled]',
                'n5 [label="5\nc = c + 5" ,shape="box"]',
                'n6 [label="6\nreturn c;" ,shape="box" ,color="green" , style=filled]',
                'n7 [label="7\nb < z * 2" ,shape="diamond" ,color="green" , style=filled]',
                'n8 [label="8\nc = c + x + 5" ,shape="box" ,color="green" , style=filled]',
                'n9 [label="9\nc = c + z + 5" ,shape="box"]',
                'n1 -> n2 []',
                'n2 -> n3 []',
                'n3 -> n4 []',
                'n4 -> n5 [label="true"]',
                'n4 -> n7 [label="false"]',
                'n5 -> n6 []',
                'n7 -> n8 [label="true"]',
                'n7 -> n9 [label="false"]',
                'n8 -> n6 []',
                'n9 -> n6 []' ].toString()
        );
    });

    it('Test 5: mapInputTypes', () => {
        assert.equal(
            mapInputTypes(input_types1).toString(),
            mapped_input_types1.toString()
        );
    });

    it('Test 6: createInputTypes', () => {
        assert.equal(
            createInputTypes(dot_program1).toString(),
            vertices_types_program1.toString()
        );
    });

    it('Test 7: cleanExceptionEntryExit', () => {
        assert.equal(
            cleanExceptionEntryExit(graphed_input_program1).toString(),
            'n1 [label="let a = x + 1;"],n2 [label="let b = a + y;"],n3 [label="let c = 0;"],n4 [label="b < z"],n5 [label="c = c + 5"],n6 [label="return c;"],n7 [label="b < z * 2"],n8 [label="c = c + x + 5"],n9 [label="c = c + z + 5"],n1 -> n2 [],n2 -> n3 [],n3 -> n4 [],n4 -> n5 [label="true"],n4 -> n7 [label="false"],n5 -> n6 [],n7 -> n8 [label="true"],n7 -> n9 [label="false"],n8 -> n6 [],n9 -> n6 []'
        );
    });

    it('Test 8: parseCode4', () => {
        assert.equal(
            parseCode( 'function foo(z){\n' +
                '   z[1] = 2;\n' +
                '   while(z[1] === 2){\n' +
                '      z[1] = 0;\n' +
                '   }\n' +
                '   return z;\n' +
                '}', '[1,2,3]'),
            'n1 [label="1\n' +
            'z[1] = 2" ,shape="box" ,color="green" , style=filled]\n' +
            'n2 [label="2\n' +
            'z[1] === 2" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n3 [label="3\n' +
            'z[1] = 0" ,shape="box" ,color="green" , style=filled]\n' +
            'n4 [label="4\n' +
            'return z;" ,shape="box" ,color="green" , style=filled]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]\n' +
            'n3 -> n2 []'
        );
    });

    it('Test 9', () => {
        assert.equal(
            parseCode('function foo(z){ \n' +
                '  let q = 1;\n' +
                '  if (z[1] === q){\n' +
                '     return 5;\n' +
                '  }\n' +
                '  return q;\n' +
                '}', '[1,2,3]'),
            'n1 [label="1\n' +
            'let q = 1;" ,shape="box" ,color="green" , style=filled]\n' +
            'n2 [label="2\n' +
            'z[1] === q" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n3 [label="3\n' +
            'return 5;" ,shape="box"]\n' +
            'n4 [label="4\n' +
            'return q;" ,shape="box" ,color="green" , style=filled]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]'
        );
    });

    it('Test 10', () => {
        assert.equal(
            parseCode('function foo(z, y){\n' +
                '  let q = 1;\n' +
                '  let a = 2;\n' +
                '  if (z[0] === q){\n' +
                '     return 5;\n' +
                '  }\n' +
                '  return q;\n' +
                '}', '[1,2,3],1').toString(),
            'n1 [label="1\n' +
            'let q = 1;" ,shape="box" ,color="green" , style=filled]\n' +
            'n2 [label="2\n' +
            'let a = 2;" ,shape="box" ,color="green" , style=filled]\n' +
            'n3 [label="3\n' +
            'z[0] === q" ,shape="diamond" ,color="green" , style=filled]\n' +
            'n4 [label="4\n' +
            'return 5;" ,shape="box" ,color="green" , style=filled]\n' +
            'n5 [label="5\n' +
            'return q;" ,shape="box"]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n5 [label="false"]'
        );
    });
});
