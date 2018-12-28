import $ from 'jquery';
import {parseCode} from './code-analyzer';

import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

var viz = new Viz({ Module, render });


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let codeToUse = $('#argumentsPlaceholder').val();

        viz.renderString('digraph  { ' + parseCode(codeToParse, codeToUse) + ' }')
            .then(result => {
                document.getElementById('parsedCode').innerHTML = result;
            });
    });
});

