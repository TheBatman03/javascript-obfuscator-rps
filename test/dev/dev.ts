'use strict';

import { NO_ADDITIONAL_NODES_PRESET } from '../../src/options/presets/NoCustomNodes';
import { StringArrayEncoding } from '../../src/enums/StringArrayEncoding';

(function () {
    const JavaScriptObfuscator: any = require('../../index');

    let obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
        `
            const foo = 'foo';
            const bar = 'bar';
                    
            function test () {
                const baz = 'baz';
                const bark = 'bark';
                const hawk = 'hawk';
            }
            
            const eagle = 'eagle';
        `,
        {
            ...NO_ADDITIONAL_NODES_PRESET,
            compact: false,
            stringArray: true,
            stringArrayThreshold: 1,
            stringArrayIntermediateVariablesCount: 5,
            stringArrayEncoding: [
                StringArrayEncoding.None
            ]
        }
    ).getObfuscatedCode();

    console.log(obfuscatedCode);
    console.log(eval(obfuscatedCode));
})();
