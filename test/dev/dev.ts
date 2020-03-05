'use strict';

import { NO_ADDITIONAL_NODES_PRESET } from '../../src/options/presets/NoCustomNodes';

(function () {
    const JavaScriptObfuscator: any = require('../../index');

    let obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
        `
             (function () {
                 const foo = 'foo';
                 const bar = { [foo]: 'bar' };
             })();
        `,
        {
            ...NO_ADDITIONAL_NODES_PRESET,
            transformObjectKeys: true,
            compact: false
        }
    ).getObfuscatedCode();

    console.log(obfuscatedCode);
    console.log(eval(obfuscatedCode));
})();
