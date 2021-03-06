import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as format from 'string-format';
import * as esgraph from 'esgraph';


let args = [[],[]];
let code_to_eval = '';

const init = () => {
    args = [[],[]];
    code_to_eval = '';
};


const splitArguments = (args) => {
    if (args.includes('[')){
        let parsed_args = esprima.parseScript(args).body[0].expression;
        if (parsed_args.expressions === undefined){
            return [escodegen.generate(parsed_args)];
        }
        else{
            return parsed_args.expressions.map((x) => escodegen.generate(x));
        }
    }
    else
        return args.split(',');
};

const parse_arguments = (code, input) => {
    if (input === '') {
        args = [[], []];
    }
    else {
        let parsed_args = splitArguments(input);
        let parsed_func = esprima.parseScript(code);

        if (parsed_args.length === 1) {
            args[0][0] = parsed_func.body[parsed_func.body.length - 1].params[0].name;
            args[1][0] = parsed_args[0];
        } else {
            for (let i = 0; i < parsed_args.length; i++) {
                args[0][i] = parsed_func.body[parsed_func.body.length - 1].params[i].name;
                args[1][i] = parsed_args[i];
            }
        }
    }
};
const generate_coded_args = () => {
    for (let i = 0; i < args[0].length; i++){
        code_to_eval = format((code_to_eval + 'let {} = {};\n'), args[0][i], args[1][i]);
    }
};

const parseGlobals = (code) => {
    let parsed = esprima.parse(code);
    if (parsed.body.length > 1){
        for (let i = 0; i < parsed.body.length - 1; i++){
            code_to_eval += escodegen.generate(parsed.body[i]) + '\n';
        }
    }
};

const stringifyExpression = {
    'BinaryExpression' : true,
    'Literal' : true,
    'Identifier' : true,
    'MemberExpression' : true,
    'UnaryExpression' : true,
    'ArrayExpression' : true};

const cleanExceptionEntryExit = (code) => {
    let splitted_code = code.trim().split('\n');
    let exception_free_code = (splitted_code.filter((x)=> !x.includes('label="exception"')));
    let n = exception_free_code.filter((x)=> x.includes('[label="exit", style="rounded"]'))[0].split(' ')[0];
    return exception_free_code.filter((x)=> !x.includes('n0')).filter((x)=> !x.includes(n));
};

const findNextVerticeIndex = (from, vertices, edges, bool) => {
    let member_edges = edges.filter((x) => x[0] === from);
    let bool_edge = member_edges.filter((x) => x[3] === bool);
    return vertices.indexOf(vertices.filter((x) => x[0] === bool_edge[0][2])[0]);
};
const findEdgeIndex =(from, edges) => {
    let member_edges = edges.filter((x) => x[0] === from);
    return edges.indexOf(member_edges[0]);
};

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
            i = vertices.indexOf(vertices.filter((x) => x[0] === edges[vertice_edge_index][2])[0]) - 1;
        }
    }
};

const paintAndShapeVertices = (graphed_input, vertices_to_color, input_types) => {
    let vertices = graphed_input.filter((x) => !x.includes('->'));
    let edges = graphed_input.filter((x) => x.includes('->'));
    for (let i = 0; i < vertices.length; i++){
        let paren_idx = vertices[i].lastIndexOf(']');
        let first_double_quote = vertices[i].indexOf('"');
        if (stringifyExpression.hasOwnProperty(input_types[i][1])) {
            vertices[i] = vertices[i].substring(0, paren_idx) + ' ,shape="diamond"]';
            vertices[i] = vertices[i].substring(0, first_double_quote + 1) + (i + 1) + '\n' + vertices[i].substring(first_double_quote + 1);
        } else {
            vertices[i] = vertices[i].substring(0, paren_idx) + ' ,shape="box"]';
            vertices[i] = vertices[i].substring(0, first_double_quote + 1) + (i + 1) + '\n' + vertices[i].substring(first_double_quote + 1);
        }
        if (vertices_to_color.includes(vertices[i].split(' ')[0])){
            paren_idx = vertices[i].lastIndexOf(']');
            vertices[i] = vertices[i].substring(0, paren_idx) + ' ,color="green" , style=filled]';
        }
    }
    return vertices.concat(edges);
};

const createInputTypes = (input_types) => {
    input_types = cleanExceptionEntryExit(input_types);
    input_types = input_types.filter((x) => !x.includes('->'));
    input_types = input_types.map((x) => [x.slice(0, x.indexOf(' ')), x.slice(x.indexOf(' ') + 1)]); //split vertice name with its label
    input_types = input_types.map((x) => [x[0], x[1].slice(x[1].indexOf('"') + 1, x[1].length - 2)]); //clean "label="

    return input_types;
};

const mapInputTypes = (input_types) => {
    let mapped_input_types = new Map();
    for(let i = 0; i < input_types.length; i++){
        mapped_input_types.set(input_types[i][0], input_types[i][1]);
    }
    return mapped_input_types;
};

const parseCode = (codeToParse, argumentsToUse) => {
    init();
    parseGlobals(codeToParse);
    parse_arguments(codeToParse, argumentsToUse);
    generate_coded_args();
    let esprimed_code = esprima.parse(codeToParse, { range: true });
    const cfg = esgraph(esprimed_code.body[esprimed_code.body.length - 1].body);
    let graphed_input = esgraph.dot(cfg, {counter:0, source: codeToParse});
    graphed_input = cleanExceptionEntryExit(graphed_input);
    let edges = graphed_input.filter((x) => x.includes('->')).map((x) => x.split(' '));
    edges = edges.map((x) => x[3] === '[]' ? x : [x[0], x[1], x[2], x[3].slice(x[3].indexOf('"') + 1, x[3].length - 2)]); //clean "label="
    let vertices = graphed_input.filter((x) => !x.includes('->'));
    vertices = vertices.map((x) => [x.slice(0, x.indexOf(' ')), x.slice(x.indexOf(' ') + 1)]); //split vertice name with its label
    vertices = vertices.map((x) => [x[0], x[1].slice(x[1].indexOf('"') + 1, x[1].length - 2)]); //clean "label="
    let input_types = createInputTypes(esgraph.dot(cfg));
    let mapped_input_types = mapInputTypes(input_types);
    let vertices_to_color = findVerticesToColor(vertices, mapped_input_types, edges);
    let colored_graph = paintAndShapeVertices(graphed_input, vertices_to_color, input_types);
    return colored_graph.join('\n');
};


export {parseCode, paintAndShapeVertices, mapInputTypes, createInputTypes, cleanExceptionEntryExit};
