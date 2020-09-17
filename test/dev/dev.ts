'use strict';

import { NO_ADDITIONAL_NODES_PRESET } from '../../src/options/presets/NoCustomNodes';

(function () {
    const JavaScriptObfuscator: any = require('../../index');

    let obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
        `
            const s = '\0ab cd';
        `,
        {
            ...NO_ADDITIONAL_NODES_PRESET,
            compact: false
        }
    ).getObfuscatedCode();

    console.log(obfuscatedCode);
    console.log(eval(obfuscatedCode));
})();
