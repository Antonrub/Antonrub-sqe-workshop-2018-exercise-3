// import * as esprima from 'esprima';
// import * as escodegen from 'escodegen';
// import * as format from 'string-format';
const esgraph = require('esgraph');
const esprima = require('esprima');
const escodegen = require('escodegen');
const format = require('string-format');

// let globalEnv = [[],[]];
// let tempEnv = [[],[]];
let args = [[],[]];
let code_to_eval = '';
// let linesToColour = [];

const parse_arguments = (code, input) => {
    if (input == '') {
        args = [[], []];
    }
    else {
        let parsed_args = esprima.parseScript(input);
        let parsed_func = esprima.parseScript(code);
        args = [[],[]];
        if (parsed_args.body[0].expression.expressions == undefined) {
            args[0][0] = stringify_identifier_expression([[],[]], parsed_func.body[0].params[0]);
            args[1][0] = stringifyExpression[parsed_args.body[0].expression.type]([[],[]], parsed_args.body[0].expression);
        } else {
            for (let i = 0; i < parsed_args.body[0].expression.expressions.length; i++) {
                args[0][i] = stringify_identifier_expression([[],[]], parsed_func.body[0].params[i]);
                args[1][i] = stringifyExpression[parsed_args.body[0].expression.expressions[i].type]([[],[]], parsed_args.body[0].expression.expressions[i]);
            }
        }
    }
};
const generate_coded_args = () => {
    for (let i = 0; i < args[0].length; i++){
        code_to_eval = format((code_to_eval + 'let {} = {};\n'), args[0][i], args[1][i]);
    }
};
// const clone_env = (env) => {return [env[0].slice(0), env[1].slice(0)];};
// const parse_func_decl = (env, parsedObject) =>{
//     parseByFunc['BlockStatement'](env, parsedObject.body);
// };
// const parse_block_statement = (env, parsedObject) => {
//     let param;
//     for(param in parsedObject.body){
//         parseByFunc[parsedObject.body[param].type](env, parsedObject.body[param]);
//     }
//     parsedObject.body = parsedObject.body.filter((x)=>{return !((x.type == 'VariableDeclaration') || ((x.type == 'ExpressionStatement') && (x.expression.type == 'AssignmentExpression') && !isArgument(x.expression.left)));});
// };
// const parse_variable_declaration = (env, parsedObject) => {
//     let param;
//     for(param in parsedObject.declarations){
//         if (parsedObject.declarations[param].init == null) {
//             env[1].push(null);
//             env[0].push(parsedObject.declarations[param].id.name);
//         }
//         else{
//             env[1].push(stringifyExpression[parsedObject.declarations[param].init.type](env, parsedObject.declarations[param].init));
//             env[0].push(parsedObject.declarations[param].id.name);
//         }
//     }
// };
// const parse_assignment_expression_right_side = (env, parsedObject) => {
//     return stringifyExpression[parsedObject.type](env, parsedObject);
// };
const binary_exp_to_string = (env, parsedObject) => {
    let result = '';
    let left = stringifyExpression[parsedObject.left.type](env, parsedObject.left);
    let right = stringifyExpression[parsedObject.right.type](env, parsedObject.right);
    if (parsedObject.operator == '*' || parsedObject.operator == '/'){
        result = left.length > 1 ? result + '(' + left + ')' : result + left;
        result = result + parsedObject.operator;
        result = right.length > 1 ? result + '(' + right + ')' : result + right;
    }
    else
        result = result + left + parsedObject.operator + right;
    return result;
};
const unary_exp_to_string = (env, parsedObject) => {
    return parsedObject.operator + stringifyExpression[parsedObject.argument.type](env, parsedObject.argument);
};
// const parse_expression_statement = (env, parsedObject) => {
//     parseByFunc[parsedObject.expression.type](env, parsedObject.expression);
// };
// const parse_assignment_expression = (env, parsedObject) => {
//     let right_side = parseByFunc['AssignmentExpressionRightSide'](env, parsedObject.right);
//     parsedObject.right = esprima.parseScript(right_side).body[0].expression;
//     let rval = parseByFunc['AssignmentExpressionRightSide'](env, parsedObject.right);
//     env[1].push(rval);
//     let lvar = parsedObject.left.name;
//     env[0].push(lvar);
//     if (args.has(parsedObject.left.name)){
//         coded_args = coded_args + lvar + '=' + rval + ';\n';
//     }
// };
// const parse_while_statement = (env, parsedObject) => {
//     let test = stringifyExpression[parsedObject.test.type](env, parsedObject.test);
//     parsedObject.test = esprima.parseScript(test).body[0].expression;
//     let evaluated_test = test_eval(test);
//     let clonedEnv = clone_env(env);
//     parseByFunc[parsedObject.body.type](clonedEnv, parsedObject.body);
//     if (evaluated_test) {env[0] = tempEnv[0]; env[1] = tempEnv[1];}
// };
const member_exp_to_string = (env, parsedObject) => {
    return '' + parsedObject.object.name + '[' + stringifyExpression[parsedObject.property.type](env, parsedObject.property) + ']';
};
// const parse_if_statement = (env, parsedObject) => {
//     let test = stringifyExpression[parsedObject.test.type](env, parsedObject.test);
//     parsedObject.test = esprima.parseScript(test).body[0].expression;
//     let evaluated_test = test_eval(test);
//     color_insert(evaluated_test);
//     let clonedIfEnv = clone_env(env);
//     parseByFunc[parsedObject.consequent.type](clonedIfEnv, parsedObject.consequent);
//     if (evaluated_test) tempEnv = clonedIfEnv;
//     if (parsedObject.alternate != null) {
//         let clonedElseEnv = clone_env(env);
//         parseByFunc[parsedObject.alternate.type](clonedElseEnv, parsedObject.alternate);
//         if (!evaluated_test) {env[0] = clonedElseEnv[0]; env[1] = clonedElseEnv[1];}
//     }
//     if (evaluated_test) {env[0] = tempEnv[0]; env[1] = tempEnv[1];}
// };
// const parse_return_statement = (env, parsedObject) => {
//     parsedObject.argument = esprima.parseScript(stringifyExpression[parsedObject.argument.type](env, parsedObject.argument)).body[0].expression;
// };
//
const stringify_binary_expression = (env, parsedObject) => {
    return binary_exp_to_string(env, parsedObject);
};
const stringify_literal_expression = (env, parsedObject) => {
    return parsedObject.raw;
};
const stringify_identifier_expression = (env, parsedObject) => {
    if (args[0].includes(parsedObject.name))
        return parsedObject.name;
    else {
        let idx = env[0].lastIndexOf(parsedObject.name);
        return idx == -1 ? parsedObject.name : env[1][idx];
    }
};
const stringify_member_expression = (env, parsedObject) => {
    return member_exp_to_string(env, parsedObject);
};
const stringify_unary_expression = (env, parsedObject) => {
    return unary_exp_to_string(env, parsedObject);
};
const stringify_array_expression = (env, parsedObject) => {
    let result = '[';
    for (let i = 0; i < parsedObject.elements.length - 1; i++)
        result = result + parsedObject.elements[i].raw + ',';
    result = result + parsedObject.elements[parsedObject.elements.length - 1].raw + ']';
    return result;
};
// const color_insert = (test) => {test ? linesToColour.push(true) : linesToColour.push(false);};
// const test_eval = (test) => {
//     return eval(coded_args + test);
// };
// const isArgument = (exp) => {
//     if (exp.type == 'Identifier') return args.has(exp.name);
//     else {
//         return args.has(exp.object.name);
//     }
// };
// const parseByFunc = {
//     'FunctionDeclaration' : parse_func_decl,
//     'BlockStatement' : parse_block_statement,
//     'VariableDeclaration' : parse_variable_declaration,
//     'ExpressionStatement' : parse_expression_statement,
//     'AssignmentExpression' : parse_assignment_expression,
//     'AssignmentExpressionRightSide' : parse_assignment_expression_right_side,
//     'WhileStatement' : parse_while_statement,
//     'IfStatement' : parse_if_statement,
//     'ReturnStatement' : parse_return_statement,
// };
const stringifyExpression = {
    'BinaryExpression' : stringify_binary_expression,
    'Literal' : stringify_literal_expression,
    'Identifier' : stringify_identifier_expression,
    'MemberExpression' : stringify_member_expression,
    'UnaryExpression' : stringify_unary_expression,
    'ArrayExpression' : stringify_array_expression};
//
// const parseCode = (codeToParse, argumentsToUse) => {
//     globalEnv = [[],[]];
//     tempEnv = [[],[]];
//     linesToColour = [];
//     coded_args = '';
//     parse_arguments(argumentsToUse);
//     generate_coded_args();
//     let parsedObject = esprima.parseScript(codeToParse, {loc:true});
//     parsedObject.body.map((x)=> parseByFunc[x.type](globalEnv, x));
//     parsedObject.body = parsedObject.body.filter((x)=>{return !((x.type == 'VariableDeclaration') || (x.type == 'ExpressionStatement') );});
//     let splittedOutput = escodegen.generate(parsedObject).split('\n');
//     let booleanLinesIndex = 0;
//     for (let i = 0; i < splittedOutput.length; i++){
//         if (splittedOutput[i].includes('if')) {
//             linesToColour[booleanLinesIndex] ? splittedOutput[i] = '<highlight_green>' + splittedOutput[i] + '</highlight_green>' : splittedOutput[i] = '<highlight_red>' + splittedOutput[i] + '</highlight_red>';
//             booleanLinesIndex++;
//         }
//     }
//     return splittedOutput.join('\n');
// };

const cleanExceptionEntryExit = (code) => {
    let splitted_code = code.trim().split('\n');
    let exception_free_code = (splitted_code.filter((x)=> !x.includes('label="exception"')));
    let n = exception_free_code.filter((x)=> x.includes('[label="exit", style="rounded"]'))[0].split(' ')[0];
    return exception_free_code.filter((x)=> !x.includes('n0')).filter((x)=> !x.includes(n));
}

const findNextVerticeIndex = (from, vertices, edges, bool) => {
    let member_edges = edges.filter((x) => x[0] == from);
    let bool_edge = member_edges.filter((x) => x[3] == bool);
    return vertices.indexOf(vertices.filter((x) => x[0] == bool_edge[0][2])[0]);
}
const findEdgeIndex =(from, edges) => {
    let member_edges = edges.filter((x) => x[0] == from);
    return edges.indexOf(member_edges[0]);
}

const findVerticesToColor = (vertices, vertices_types, edges) =>{
    let to_color = [];
    for(let i = 0; i < vertices.length; i++){
        to_color.push(vertices[i][0]); //add vertice of the edge
        code_to_eval += vertices[i][1] + '\n';
        if (vertices[i][1].includes('return')) return to_color;
        else if (stringifyExpression.hasOwnProperty(vertices_types.get(vertices[i][0]))){
            i = findNextVerticeIndex(vertices[i][0], vertices, edges, eval(code_to_eval).toString()) - 1;
        }
        else{
            let vertice_edge_index = findEdgeIndex(vertices[i][0], edges);
            i = vertices.indexOf(vertices.filter((x) => x[0] == edges[vertice_edge_index][2])[0]) - 1;
        }
        //console.log('infinite loop');
    }

    return to_color;
}

function paintAndShapeVertices(graphed_input, vertices_to_color, input_types) {
    let vertices = graphed_input.filter((x) => !x.includes('->'));
    let edges = graphed_input.filter((x) => x.includes('->'));
    for (let i = 0; i < vertices.length; i++){
        let paren_idx = vertices[i].lastIndexOf(']');
        let first_double_quote = vertices[i].indexOf('"');
        if (stringifyExpression.hasOwnProperty(input_types[i][1])) {
            vertices[i] = vertices[i].substring(0, paren_idx) + ' ,shape="diamond"]';
            vertices[i] = vertices[i].substring(0, first_double_quote + 1) + (i + 1) + '\n' + vertices[i].substring(first_double_quote + 1);
        }
        else {
            vertices[i] = vertices[i].substring(0, paren_idx) + ' ,shape="box"]';
            vertices[i] = vertices[i].substring(0, first_double_quote + 1) + (i + 1) + '\n' + vertices[i].substring(first_double_quote + 1);
        }
        if (vertices_to_color.includes(vertices[i].split(' ')[0])){
            paren_idx = vertices[i].lastIndexOf(']');
            vertices[i] = vertices[i].substring(0, paren_idx) + ' ,color="green" , style=filled]';
        }
    }
    return vertices.concat(edges);
}

const parseCode = (codeToParse, argumentsToUse) => {
    parse_arguments(codeToParse, argumentsToUse);
    generate_coded_args();
    const cfg = esgraph(esprima.parse(codeToParse, { range: true }).body[0].body);
    let graphed_input = esgraph.dot(cfg, {counter:0, source: codeToParse});
    graphed_input = cleanExceptionEntryExit(graphed_input);

    let edges = graphed_input.filter((x) => x.includes('->')).map((x) => x.split(' '));
    edges = edges.map((x) => x[3] == '[]' ? x : [x[0], x[1], x[2], x[3].slice(x[3].indexOf('"') + 1, x[3].length - 2)]); //clean "label="

    let vertices = graphed_input.filter((x) => !x.includes('->'));
    vertices = vertices.map((x) => [x.slice(0, x.indexOf(' ')), x.slice(x.indexOf(' ') + 1)]); //split vertice name with its label
    vertices = vertices.map((x) => [x[0], x[1].slice(x[1].indexOf('"') + 1, x[1].length - 2)]); //clean "label="

    let input_types = esgraph.dot(cfg);
    input_types = cleanExceptionEntryExit(input_types);
    input_types = input_types.filter((x) => !x.includes('->'));
    input_types = input_types.map((x) => [x.slice(0, x.indexOf(' ')), x.slice(x.indexOf(' ') + 1)]); //split vertice name with its label
    input_types = input_types.map((x) => [x[0], x[1].slice(x[1].indexOf('"') + 1, x[1].length - 2)]); //clean "label="
    let mapped_input_types = new Map();
    for(let i = 0; i < input_types.length; i++){
        mapped_input_types.set(input_types[i][0], input_types[i][1]);
    }
    let vertices_to_color = findVerticesToColor(vertices, mapped_input_types, edges);
    let colored_graph = paintAndShapeVertices(graphed_input, vertices_to_color, input_types);
    //console.log(graphed_input);

    return colored_graph.join('\n');
};


// console.log(parseCode( 'function foo(x, y, z){\n' +
//     '    let a = x + 1;\n' +
//     '    let b = a + y;\n' +
//     '    let c = 0;\n' +
//     '    \n' +
//     '    if (b < z) {\n' +
//     '        c = c + 5;\n' +
//     '    } else if (b < z * 2) {\n' +
//     '        c = c + x + 5;\n' +
//     '    } else {\n' +
//     '        c = c + z + 5;\n' +
//     '    }\n' +
//     '    \n' +
//     '    return c;\n' +
//     '}\n', '1, 2, 3'));

// console.log(parseCode( 'function foo(x, y, z){\n' +
//     '   let a = x + 1;\n' +
//     '   let b = a + y;\n' +
//     '   let c = 0;\n' +
//     '   \n' +
//     '   while (a < z) {\n' +
//     '       c = a + b;\n' +
//     '       a++;\n' +
//     '   }\n' +
//     '   \n' +
//     '   return z;\n' +
//     '}\n', '1, 2, 3'));

// console.log(parseCode( 'function f(x , y, z){\n' +
//     '\n' +
//     '    if(true)\n' +
//     '    {\n' +
//     '        if(false)\n' +
//     '        {\n' +
//     '            let b = 1;\n' +
//     '            return b;\n' +
//     '        }\n' +
//     '        else if(false){\n' +
//     '            let a = 1;\n' +
//     '            let b = false;\n' +
//     '            while(b)\n' +
//     '            {\n' +
//     '                console.log(123);\n' +
//     '            }\n' +
//     '        } else{\n' +
//     '            let b = 3;\n' +
//
//     '        }\n' +
//     '    }\n' +
//     '    let t = 0;\n' +
//     '    while(t < 3 )\n' +
//     '    {\n' +
//     '        if(true){\n' +
//     '            t = t + 1;                   \n' +
//     '        }else if(false)\n' +
//     '        {\n' +
//     '            t = t - 1;\n' +
//     '        }else{\n' +
//     '            t = t - 1;\n' +
//     '        }\n' +
//     '    }\n' +
//     '    \n' +
//     '    if(false)\n' +
//     '    {\n' +
//     '        let c = 10;\n' +
//     '        return c;\n' +
//     '    }else{\n' +
//     '        if(true){\n' +
//     '            return 11111;\n' +
//     '        }\n' +
//     '    }\n' +
//     '}', '1 , 2, 111'));


module.exports = (parseCode);
//export {parseCode};
