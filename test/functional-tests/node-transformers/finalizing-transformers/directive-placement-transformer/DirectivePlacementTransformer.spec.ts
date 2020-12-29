import { assert } from 'chai';

import { NO_ADDITIONAL_NODES_PRESET } from '../../../../../src/options/presets/NoCustomNodes';

import { readFileAsString } from '../../../../helpers/readFileAsString';

import { JavaScriptObfuscator } from '../../../../../src/JavaScriptObfuscatorFacade';

describe('DirectivePlacementTransformer', function () {
    this.timeout(120000);

    describe('Program lexical scope', () => {
        describe('Variant #1: directive at the top of program scope', () => {
            const directiveRegExp: RegExp = /^'use strict'; *var _0x([a-f0-9]){4} *= *\['test'];/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/top-of-program-scope.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1
                    }
                ).getObfuscatedCode();
            });

            it('should keep directive at the top of program scope', () => {
                assert.match(obfuscatedCode, directiveRegExp);
            });
        });

        describe('Variant #2: directive-like string literal at the middle of program scope', () => {
            const directiveRegExp: RegExp = new RegExp(
                '^var _0x([a-f0-9]){4} *= *\\[\'test\', *\'use\\\\x20strict\']; *' +
                '.*?' +
                'var test *= *_0x([a-f0-9]){4}\\(0x0\\); *' +
                '_0x([a-f0-9]){4}\\(0x1\\);'
            );

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/middle-of-program-scope.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1
                    }
                ).getObfuscatedCode();
            });

            it('should keep directive-like string literal at the middle of program scope', () => {
                assert.match(obfuscatedCode, directiveRegExp);
            });
        });
    });

    describe('Function lexical scope', () => {
        describe('Variant #1: directive at the top of function scope', () => {
            const directiveRegExp: RegExp = new RegExp(
                'function test\\(\\) *{ *' +
                    '\'use strict\'; *' +
                    'var _0x([a-f0-9]){4,6} *= *_0x([a-f0-9]){4}; *' +
                    'var _0x([a-f0-9]){4,6} *= *_0x([a-f0-9]){4,6}\\(0x0\\);'
            );

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/top-of-function-scope.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1,
                        stringArrayWrappersCount: 1
                    }
                ).getObfuscatedCode();
            });

            it('should keep directive at the top of function scope', () => {
                assert.match(obfuscatedCode, directiveRegExp);
            });
        });

        describe('Variant #2: directive-like string literal at the middle of function scope', () => {
            const directiveRegExp: RegExp = new RegExp(
                'function test\\(\\) *{ *' +
                    'var _0x([a-f0-9]){4,6} *= *_0x([a-f0-9]){4}; *' +
                    'var _0x([a-f0-9]){4,6} *= *_0x([a-f0-9]){4,6}\\(0x0\\);' +
                    '_0x([a-f0-9]){4,6}\\(0x1\\);'
            );

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/middle-of-function-scope.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1,
                        stringArrayWrappersCount: 1
                    }
                ).getObfuscatedCode();
            });

            it('should keep directive-like string literal at the middle of function scope', () => {
                assert.match(obfuscatedCode, directiveRegExp);
            });
        })
    });
});
