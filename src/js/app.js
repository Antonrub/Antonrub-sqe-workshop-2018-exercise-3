import $ from 'jquery';
import {parseCode} from './code-analyzer';

const Viz = require('viz.js');
const { Module, render } = require('viz.js/full.render.js');

let viz = new Viz({ Module, render });



$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let codeToUse = $('#argumentsPlaceholder').val();
        let parsedCode = parseCode(codeToParse, codeToUse);

        viz.renderString('digraph { a -> b }')
            .then(result => {
                document.getElementById('parsedCode').innerHTML = result;
            })
            .catch(error => {
                // Create a new Viz instance (@see Caveats page for more info)
                viz = new Viz({ Module, render });

                // Possibly display the error
                console.error(error);
            });

        //document.getElementById('parsedCode').innerHTML = parsedCode;
    });
});

