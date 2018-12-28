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
            })
            .catch(error => {
                // Create a new Viz instance (@see Caveats page for more info)
                viz = new Viz({ Module, render });

                // Possibly display the error
                console.error(error);
            });
        // viz.renderString('digraph { a -> b }')
        //     .then(result => {
        //         document.getElementById('parsedCode').innerHTML = result;
        //     })
        //     .catch(error => {
        //         // Create a new Viz instance (@see Caveats page for more info)
        //         viz = new Viz({ Module, render });
        //
        //         // Possibly display the error
        //         console.error(error);
        //     });

        //document.getElementById('parsedCode').innerHTML = parsedCode;
    });
});

