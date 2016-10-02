import { IObfuscationResult } from '../../../../src/interfaces/IObfuscationResult';

import { JavaScriptObfuscator } from '../../../../src/JavaScriptObfuscator';

const assert: Chai.AssertStatic = require('chai').assert;

describe('ConsoleOutputDisableExpressionNode', () => {
    it('should correctly append `ConsoleOutputDisableExpressionNode` custom node into the obfuscated code if `disableConsoleOutput` option is set', () => {
        let obfuscationResult: IObfuscationResult = JavaScriptObfuscator.obfuscate(
            `var test = 'test';`,
            {
                disableConsoleOutput: true,
                unicodeArrayThreshold: 1
            }
        );

        assert.match(obfuscationResult.getObfuscatedCode(), /for *\(_0x([a-z0-9]){4,6} in _0x([a-z0-9]){4,6} *= *_0x([a-z0-9]){4}\('0x.*'\)\)/);
    });

    it('should\'t append `ConsoleOutputDisableExpressionNode` custom node into the obfuscated code if `disableConsoleOutput` option is not set', () => {
        let obfuscationResult: IObfuscationResult = JavaScriptObfuscator.obfuscate(
            `var test = 'test';`,
            {
                disableConsoleOutput: false,
                unicodeArrayThreshold: 1
            }
        );

        assert.notMatch(obfuscationResult.getObfuscatedCode(), /for *\(_0x([a-z0-9]){4,6} in _0x([a-z0-9]){4,6} *= *_0x([a-z0-9]){4}\('0x.*'\)\)/);
    });
});
