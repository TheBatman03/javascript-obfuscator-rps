import { assert } from 'chai';

import { IdentifierNamesGenerator } from '../../../../../src/enums/generators/identifier-names-generators/IdentifierNamesGenerator';
import { StringArrayEncoding } from '../../../../../src/enums/StringArrayEncoding';

import { NO_ADDITIONAL_NODES_PRESET } from '../../../../../src/options/presets/NoCustomNodes';

import { readFileAsString } from '../../../../helpers/readFileAsString';
import { getRegExpMatch } from '../../../../helpers/getRegExpMatch';

import { JavaScriptObfuscator } from '../../../../../src/JavaScriptObfuscatorFacade';

describe('LiteralTransformer', () => {
    describe('transformation of literal node with string value', () => {
        describe('Variant #1: default behaviour', () => {
            const stringArrayRegExp: RegExp = /^var *_0x([a-f0-9]){4} *= *\['test'\];/;
            const stringArrayCallRegExp: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0'\);/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1
                    }
                ).getObfuscatedCode();
            });

            it('match #1: should replace literal node value with value from string array', () => {
                assert.match(obfuscatedCode, stringArrayRegExp);
            });

            it('match #2: should replace literal node value with value from string array', () => {
                assert.match(obfuscatedCode, stringArrayCallRegExp);
            });
        });

        describe('Variant #2: `stringArray` option is disabled', () => {
            const regExp: RegExp = /^var *test *= *'test';/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET
                    }
                ).getObfuscatedCode();
            });

            it('shouldn\'t replace literal node value with value from string array', () => {
                assert.match(obfuscatedCode, regExp);
            });
        });

        describe('Variant #3: string contains non-latin and non-digit characters and `unicodeEscapeSequence` is disabled', () => {
            let testFunc: () => void;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/error-when-non-latin.js');

                testFunc = () => JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1
                    }
                );
            });

            it('should\'t throw an error', () => {
                assert.doesNotThrow(testFunc);
            });
        });

        describe('Variant #4: same literal node values', () => {
            const stringArrayRegExp: RegExp = /^var *_0x([a-f0-9]){4} *= *\['test'\];/;
            const stringArrayCallRegExp: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0'\);/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/same-literal-values.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1
                    }
                ).getObfuscatedCode();
            });

            it('match #1: should create only one item in string array for same literal node values', () => {
                assert.match(obfuscatedCode, stringArrayRegExp);
            });

            it('match #2: should create only one item in string array for same literal node values', () => {
                assert.match(obfuscatedCode, stringArrayCallRegExp);
            });
        });

        describe('Variant #5: `unicodeEscapeSequence` option is enabled', () => {
            const regExp: RegExp = /^var *test *= *'\\x74\\x65\\x73\\x74';$/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        unicodeEscapeSequence: true

                    }
                ).getObfuscatedCode();
            });

            it('should replace literal node value with unicode escape sequence', () => {
                assert.match(obfuscatedCode, regExp);
            });
        });

        describe('Variant #6: `unicodeEscapeSequence` and `stringArray` options are enabled', () => {
            const stringArrayRegExp: RegExp = /^var *_0x([a-f0-9]){4} *= *\['\\x74\\x65\\x73\\x74'\];/;
            const stringArrayCallRegExp: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0'\);/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1,
                        unicodeEscapeSequence: true
                    }
                ).getObfuscatedCode();
            });

            it('match #1: should replace literal node value with unicode escape sequence from string array', () => {
                assert.match(obfuscatedCode, stringArrayRegExp);
            });

            it('match #1: should replace literal node value with unicode escape sequence from string array', () => {
                assert.match(obfuscatedCode, stringArrayCallRegExp);
            });
        });

        describe('Variant #7: short literal node value', () => {
            const regExp: RegExp = /var *test *= *'te';/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/short-literal-value.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1
                    }
                ).getObfuscatedCode();
            });

            it('shouldn\'t replace short literal node value with value from string array', () => {
                assert.match(obfuscatedCode, regExp);
            });
        });

        describe('Variant #8: base64 encoding', () => {
            const stringArrayRegExp: RegExp = /^var *_0x([a-f0-9]){4} *= *\['dGVzdA=='\];/;
            const stringArrayCallRegExp: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0'\);/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayEncoding: StringArrayEncoding.Base64,
                        stringArrayThreshold: 1
                    }
                ).getObfuscatedCode();
            });

            it('match #1: should replace literal node value with value from string array encoded using base64', () => {
                assert.match(obfuscatedCode, stringArrayRegExp);
            });

            it('match #2: should replace literal node value with value from string array encoded using base64', () => {
                assert.match(obfuscatedCode, stringArrayCallRegExp);
            });
        });

        describe('Variant #9: rc4 encoding', () => {
            describe('Variant #1: single string literal', () => {
                const regExp: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0', *'.{4}'\);/;

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            stringArray: true,
                            stringArrayEncoding: StringArrayEncoding.Rc4,
                            stringArrayThreshold: 1
                        }
                    ).getObfuscatedCode();
                });

                it('should replace literal node value with value from string array encoded using rc4', () => {
                    assert.match(obfuscatedCode, regExp);
                });
            });

            describe('Variant #2: multiple string literals', () => {
                const variableRegExp1: RegExp = /var *test *= *_0x(?:[a-f0-9]){4}\('0x0', *'(.{4})'\);/;
                const variableRegExp2: RegExp = /var *test *= *_0x(?:[a-f0-9]){4}\('0x1', *'(.{4})'\);/;

                let encodedLiteralValue1: string;
                let encodedLiteralValue2: string;

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/same-literal-values.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            seed: 1, // set seed to prevent rare case when all encoded values are the same
                            stringArray: true,
                            stringArrayEncoding: StringArrayEncoding.Rc4,
                            stringArrayThreshold: 1
                        }
                    ).getObfuscatedCode();

                    encodedLiteralValue1 = getRegExpMatch(obfuscatedCode, variableRegExp1);
                    encodedLiteralValue2 = getRegExpMatch(obfuscatedCode, variableRegExp2);
                });

                it('Match #1: should replace literal node value with value from string array encoded using rc4', () => {
                    assert.match(obfuscatedCode, variableRegExp1);
                });

                it('Match #2: should replace literal node value with value from string array encoded using rc4', () => {
                    assert.match(obfuscatedCode, variableRegExp2);
                });

                it('Should encode same values as two different encoded string array items', () => {
                    assert.notEqual(encodedLiteralValue1, encodedLiteralValue2);
                });
            });
        });

        describe('Variant #10: `stringArrayThreshold` option value', () => {
            const samples: number = 1000;
            const stringArrayThreshold: number = 0.5;
            const delta: number = 0.1;

            const regExp1: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0'\);/g;
            const regExp2: RegExp = /var *test *= *'test';/g;

            let stringArrayProbability: number,
                noStringArrayProbability: number;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                const obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
                    `${code}\n`.repeat(samples),
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: stringArrayThreshold
                    }
                ).getObfuscatedCode();

                const stringArrayMatchesLength: number = obfuscatedCode
                    .match(regExp1)!
                    .length;
                const noStringArrayMatchesLength: number = obfuscatedCode
                    .match(regExp2)!
                    .length;

                stringArrayProbability = stringArrayMatchesLength / samples;
                noStringArrayProbability = noStringArrayMatchesLength / samples;
            });

            it('Variant #1: should replace literal node value with value from string array with `stringArrayThreshold` chance', () => {
                assert.closeTo(stringArrayProbability, stringArrayThreshold, delta);
            });

            it('Variant #2: shouldn\'t replace literal node value with value from string array with `(1 - stringArrayThreshold)` chance', () => {
                assert.closeTo(noStringArrayProbability, stringArrayThreshold, delta);
            });
        });

        describe('Variant #11: string array calls wrapper name', () => {
            const regExp: RegExp = /console\[b\('0x0'\)]\('a'\);/;

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/string-array-calls-wrapper-name.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        stringArray: true,
                        stringArrayThreshold: 1,
                        identifierNamesGenerator: IdentifierNamesGenerator.MangledIdentifierNamesGenerator
                    }
                ).getObfuscatedCode();
            });

            it('match #1: should keep identifier with string array calls wrapper name untouched after obfuscation', () => {
                assert.match(obfuscatedCode, regExp);
            });
        });

        describe('Variant #12: `reservedStrings` option is enabled', () => {
            describe('Variant #1: base `reservedStrings` values', () => {
                describe('Variant #1: single reserved string value', () => {
                    const stringLiteralRegExp1: RegExp = /const foo *= *'foo';/;
                    const stringLiteralRegExp2: RegExp = /const bar *= *_0x([a-f0-9]){4}\('0x0'\);/;

                    let obfuscatedCode: string;

                    before(() => {
                        const code: string = readFileAsString(__dirname + '/fixtures/reserved-strings-option-1.js');

                        obfuscatedCode = JavaScriptObfuscator.obfuscate(
                            code,
                            {
                                ...NO_ADDITIONAL_NODES_PRESET,
                                stringArray: true,
                                stringArrayThreshold: 1,
                                reservedStrings: ['foo']
                            }
                        ).getObfuscatedCode();
                    });

                    it('match #1: should ignore reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp1);
                    });

                    it('match #2: should transform non-reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp2);
                    });
                });

                describe('Variant #2: two reserved string values', () => {
                    const stringLiteralRegExp1: RegExp = /const foo *= *'foo';/;
                    const stringLiteralRegExp2: RegExp = /const bar *= *'bar';/;

                    let obfuscatedCode: string;

                    before(() => {
                        const code: string = readFileAsString(__dirname + '/fixtures/reserved-strings-option-1.js');

                        obfuscatedCode = JavaScriptObfuscator.obfuscate(
                            code,
                            {
                                ...NO_ADDITIONAL_NODES_PRESET,
                                stringArray: true,
                                stringArrayThreshold: 1,
                                reservedStrings: ['foo', 'bar']
                            }
                        ).getObfuscatedCode();
                    });

                    it('match #1: should ignore reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp1);
                    });

                    it('match #2: should ignore reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp2);
                    });
                });
            });

            describe('Variant #2: RegExp `reservedStrings` values', () => {
                describe('Variant #1: single reserved string value', () => {
                    const stringLiteralRegExp1: RegExp = /const foo *= *_0x([a-f0-9]){4}\('0x0'\);/;
                    const stringLiteralRegExp2: RegExp = /const bar *= *'bar';/;

                    let obfuscatedCode: string;

                    before(() => {
                        const code: string = readFileAsString(__dirname + '/fixtures/reserved-strings-option-1.js');

                        obfuscatedCode = JavaScriptObfuscator.obfuscate(
                            code,
                            {
                                ...NO_ADDITIONAL_NODES_PRESET,
                                stringArray: true,
                                stringArrayThreshold: 1,
                                reservedStrings: ['ar$']
                            }
                        ).getObfuscatedCode();
                    });

                    it('match #1: should transform non-reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp1);
                    });

                    it('match #2: should ignore reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp2);
                    });
                });

                describe('Variant #2: two reserved string values', () => {
                    const stringLiteralRegExp1: RegExp = /const foo *= *'foo';/;
                    const stringLiteralRegExp2: RegExp = /const bar *= *'bar';/;

                    let obfuscatedCode: string;

                    before(() => {
                        const code: string = readFileAsString(__dirname + '/fixtures/reserved-strings-option-1.js');

                        obfuscatedCode = JavaScriptObfuscator.obfuscate(
                            code,
                            {
                                ...NO_ADDITIONAL_NODES_PRESET,
                                stringArray: true,
                                stringArrayThreshold: 1,
                                reservedStrings: ['^fo', '.ar']
                            }
                        ).getObfuscatedCode();
                    });

                    it('match #1: should ignore reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp1);
                    });

                    it('match #2: should ignore reserved strings', () => {
                        assert.match(obfuscatedCode, stringLiteralRegExp2);
                    });
                });
            });

            describe('Variant #3: `unicodeEscapeSequence` option is enabled', () => {
                const stringLiteralRegExp1: RegExp = /const foo *= *'foo';/;
                const stringLiteralRegExp2: RegExp = /const bar *= *'\\x62\\x61\\x72';/;

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/reserved-strings-option-1.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            reservedStrings: ['foo'],
                            unicodeEscapeSequence: true
                        }
                    ).getObfuscatedCode();
                });

                it('match #1: should ignore reserved strings', () => {
                    assert.match(obfuscatedCode, stringLiteralRegExp1);
                });

                it('match #2: should transform non-reserved strings', () => {
                    assert.match(obfuscatedCode, stringLiteralRegExp2);
                });
            });

            describe('Variant #4: correct escape of special characters', () => {
                const stringLiteralRegExp: RegExp = /var baz *= *'Cannot find module \\'' *\+ *foo *\+ *'\\x27';/;

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/reserved-strings-option-2.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            reservedStrings: ['a']
                        }
                    ).getObfuscatedCode();
                });

                it('match #1: should ignore reserved strings', () => {
                    assert.match(obfuscatedCode, stringLiteralRegExp);
                });
            });
        });
    });

    describe('transformation of literal node with boolean value', () => {
        const regExp: RegExp = /^var *test *= *!!\[\];$/;

        let obfuscatedCode: string;

        before(() => {
            const code: string = readFileAsString(__dirname + '/fixtures/boolean-value.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    stringArray: true,
                    stringArrayThreshold: 1
                }
            ).getObfuscatedCode();
        });

        it('should transform literal node', () => {
            assert.match(obfuscatedCode, regExp);
        });
    });

    describe('transformation of literal node with number value', () => {
        const regExp: RegExp = /^var *test *= *0x0;$/;

        let obfuscatedCode: string;

        before(() => {
            const code: string = readFileAsString(__dirname + '/fixtures/number-value.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    stringArray: true,
                    stringArrayThreshold: 1
                }
            ).getObfuscatedCode();
        });

        it('should transform literal node', () => {
            assert.match(obfuscatedCode, regExp);
        });
    });

    describe('RegExp literal', () => {
        const regExp: RegExp = /^var *regExp *= *\/\(\\d\+\)\/;$/;

        let obfuscatedCode: string;

        before(() => {
            const code: string = readFileAsString(__dirname + '/fixtures/regexp-literal.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    stringArray: true,
                    stringArrayThreshold: 1
                }
            ).getObfuscatedCode();
        });

        it('should keep safe value of RegExp literal', () => {
            assert.match(obfuscatedCode, regExp);
        });
    });

    describe('Rotate string array', function () {
        this.timeout(100000);

        describe('Variant #1: single string array value', () => {
            const samples: number = 1000;
            const delta: number = 0.1;
            const expectedVariantProbability: number = 1;

            const stringArrayVariant1RegExp1: RegExp = /var *_0x([a-f0-9]){4} *= *\['test'];/g;
            const literalNodeVariant1RegExp: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0'\);/g;

            let stringArrayVariant1Probability: number,
                literalNodeVariant1Probability: number;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                let stringArrayVariant1MatchesLength: number = 0;
                let literalNodeVariant1MatchesLength: number = 0;

               for (let i = 0; i < samples; i++) {
                   const obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
                       code,
                       {
                           ...NO_ADDITIONAL_NODES_PRESET,
                           rotateStringArray: true,
                           stringArray: true,
                           stringArrayThreshold: 1
                       }
                   ).getObfuscatedCode();

                   if (obfuscatedCode.match(stringArrayVariant1RegExp1)) {
                       stringArrayVariant1MatchesLength++;
                   }

                   if (obfuscatedCode.match(literalNodeVariant1RegExp)) {
                       literalNodeVariant1MatchesLength++;
                   }
               }

                stringArrayVariant1Probability = stringArrayVariant1MatchesLength / samples;
                literalNodeVariant1Probability = literalNodeVariant1MatchesLength / samples;
            });

            describe('String array probability', () => {
                it('Variant #1: should create single string array variant', () => {
                    assert.closeTo(stringArrayVariant1Probability, expectedVariantProbability, delta);
                });
            });

            describe('Literal node probability', () => {
                it('Variant #1: should replace literal node with call to string array variant', () => {
                    assert.closeTo(literalNodeVariant1Probability, expectedVariantProbability, delta);
                });
            });
        });

        describe('Variant #2: Three string array values', () => {
            const samples: number = 1000;
            const delta: number = 0.1;
            const expectedStringArrayVariantProbability: number = 0.33;
            const expectedLiteralNodeVariantProbability: number = 1;

            const stringArrayVariantsCount: number = 3;
            const literalNodeVariantsCount: number = 1;

            const stringArrayVariantRegExps: RegExp[] = [
                /var *_0x([a-f0-9]){4} *= *\['foo', *'bar', *'baz'];/g,
                /var *_0x([a-f0-9]){4} *= *\['bar', *'baz', *'foo'];/g,
                /var *_0x([a-f0-9]){4} *= *\['baz', *'foo', *'bar'];/g
            ];
            const literalNodeVariantRegExps: RegExp[] = [
                new RegExp(
                    `var *foo *= *_0x([a-f0-9]){4}\\('0x0'\\); *` +
                    `var *bar *= *_0x([a-f0-9]){4}\\('0x1'\\); *` +
                    `var *baz *= *_0x([a-f0-9]){4}\\('0x2'\\);`
                )
            ];

            const stringArrayVariantProbabilities: number[] = new Array(stringArrayVariantsCount).fill(0);
            const literalNodeVariantProbabilities: number[] = new Array(literalNodeVariantsCount).fill(0);

            const stringArrayVariantMatchesLength: number[] = new Array(stringArrayVariantsCount).fill(0);
            const literalNodeVariantMatchesLength: number[] = new Array(literalNodeVariantsCount).fill(0);

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/three-strings.js');

                for (let i = 0; i < samples; i++) {
                    const obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            rotateStringArray: true,
                            stringArray: true,
                            stringArrayThreshold: 1
                        }
                    ).getObfuscatedCode();

                    for (let variantIndex = 0; variantIndex < stringArrayVariantsCount; variantIndex++) {
                        if (obfuscatedCode.match(stringArrayVariantRegExps[variantIndex])) {
                            stringArrayVariantMatchesLength[variantIndex]++;
                        }

                        if (obfuscatedCode.match(literalNodeVariantRegExps[variantIndex])) {
                            literalNodeVariantMatchesLength[variantIndex]++;
                        }
                    }
                }

                for (let variantIndex = 0; variantIndex < stringArrayVariantsCount; variantIndex++) {
                    stringArrayVariantProbabilities[variantIndex] = stringArrayVariantMatchesLength[variantIndex] / samples;
                }

                for (let variantIndex = 0; variantIndex < literalNodeVariantsCount; variantIndex++) {
                    literalNodeVariantProbabilities[variantIndex] = literalNodeVariantMatchesLength[variantIndex] / samples;
                }
            });

            describe('String array probability', () => {
                for (let variantIndex = 0; variantIndex < stringArrayVariantsCount; variantIndex++) {
                    const variantNumber: number = variantIndex + 1;

                    it(`Variant #${variantNumber}: should create string array variant`, () => {
                        assert.closeTo(stringArrayVariantProbabilities[variantIndex], expectedStringArrayVariantProbability, delta);
                    });
                }
            });

            describe('Literal node probability', () => {
                for (let variantIndex = 0; variantIndex < literalNodeVariantsCount; variantIndex++) {
                    const variantNumber: number = variantIndex + 1;

                    it(`Variant #${variantNumber}: should replace literal node with call to string array variant`, () => {
                        assert.closeTo(literalNodeVariantProbabilities[variantIndex], expectedLiteralNodeVariantProbability, delta);
                    });
                }
            });
        });
    });

    describe('Shuffle string array', function () {
        this.timeout(100000);

        describe('Variant #1: single string array value', () => {
            const samples: number = 1000;
            const delta: number = 0.1;
            const expectedVariantProbability: number = 1;

            const stringArrayVariantRegExp1: RegExp = /var *_0x([a-f0-9]){4} *= *\['test'];/g;
            const literalNodeVariant1RegExp: RegExp = /var *test *= *_0x([a-f0-9]){4}\('0x0'\);/g;

            let stringArrayVariant1Probability: number,
                literalNodeVariant1Probability: number;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

                let stringArrayVariant1MatchesLength: number = 0;
                let literalNodeVariant1MatchesLength: number = 0;

                for (let i = 0; i < samples; i++) {
                    const obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            shuffleStringArray: true,
                            stringArray: true,
                            stringArrayThreshold: 1
                        }
                    ).getObfuscatedCode();

                    if (obfuscatedCode.match(stringArrayVariantRegExp1)) {
                        stringArrayVariant1MatchesLength++;
                    }

                    if (obfuscatedCode.match(literalNodeVariant1RegExp)) {
                        literalNodeVariant1MatchesLength++;
                    }
                }

                stringArrayVariant1Probability = stringArrayVariant1MatchesLength / samples;
                literalNodeVariant1Probability = literalNodeVariant1MatchesLength / samples;
            });

            describe('String array probability', () => {
                it('Variant #1: should create string array variant', () => {
                    assert.closeTo(stringArrayVariant1Probability, expectedVariantProbability, delta);
                });
            });

            describe('Literal node probability', () => {
                it('Variant #1: should replace literal node with call to string array variant', () => {
                    assert.closeTo(literalNodeVariant1Probability, expectedVariantProbability, delta);
                });
            });
        });

        describe('Variant #2: Three string array values', () => {
            const samples: number = 1000;
            const delta: number = 0.1;
            const expectedVariantProbability: number = 0.166;

            const variantsCount: number = 6;

            const stringArrayVariantRegExps: RegExp[] = [
                /var *_0x([a-f0-9]){4} *= *\['foo', *'bar', *'baz'];/g,
                /var *_0x([a-f0-9]){4} *= *\['foo', *'baz', *'bar'];/g,
                /var *_0x([a-f0-9]){4} *= *\['bar', *'foo', *'baz'];/g,
                /var *_0x([a-f0-9]){4} *= *\['bar', *'baz', *'foo'];/g,
                /var *_0x([a-f0-9]){4} *= *\['baz', *'foo', *'bar'];/g,
                /var *_0x([a-f0-9]){4} *= *\['baz', *'bar', *'foo'];/g
            ];

            const literalNodeVariantRegExps: RegExp[] = [
                new RegExp(
                    `var *foo *= *_0x([a-f0-9]){4}\\('0x0'\\); *` +
                    `var *bar *= *_0x([a-f0-9]){4}\\('0x1'\\); *` +
                    `var *baz *= *_0x([a-f0-9]){4}\\('0x2'\\);`
                ),
                new RegExp(
                    `var *foo *= *_0x([a-f0-9]){4}\\('0x0'\\); *` +
                    `var *bar *= *_0x([a-f0-9]){4}\\('0x2'\\); *` +
                    `var *baz *= *_0x([a-f0-9]){4}\\('0x1'\\);`
                ),
                new RegExp(
                    `var *foo *= *_0x([a-f0-9]){4}\\('0x1'\\); *` +
                    `var *bar *= *_0x([a-f0-9]){4}\\('0x0'\\); *` +
                    `var *baz *= *_0x([a-f0-9]){4}\\('0x2'\\);`
                ),
                new RegExp(
                    `var *foo *= *_0x([a-f0-9]){4}\\('0x1'\\); *` +
                    `var *bar *= *_0x([a-f0-9]){4}\\('0x2'\\); *` +
                    `var *baz *= *_0x([a-f0-9]){4}\\('0x0'\\);`
                ),
                new RegExp(
                    `var *foo *= *_0x([a-f0-9]){4}\\('0x2'\\); *` +
                    `var *bar *= *_0x([a-f0-9]){4}\\('0x0'\\); *` +
                    `var *baz *= *_0x([a-f0-9]){4}\\('0x1'\\);`
                ),
                new RegExp(
                    `var *foo *= *_0x([a-f0-9]){4}\\('0x2'\\); *` +
                    `var *bar *= *_0x([a-f0-9]){4}\\('0x1'\\); *` +
                    `var *baz *= *_0x([a-f0-9]){4}\\('0x0'\\);`
                )
            ];

            const stringArrayVariantProbabilities: number[] = new Array(variantsCount).fill(0);
            const literalNodeVariantProbabilities: number[] = new Array(variantsCount).fill(0);

            const stringArrayVariantMatchesLength: number[] = new Array(variantsCount).fill(0);
            const literalNodeVariantMatchesLength: number[] = new Array(variantsCount).fill(0);

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/three-strings.js');

                for (let i = 0; i < samples; i++) {
                    const obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            shuffleStringArray: true,
                            stringArray: true,
                            stringArrayThreshold: 1
                        }
                    ).getObfuscatedCode();

                    for (let variantIndex = 0; variantIndex < variantsCount; variantIndex++) {
                        if (obfuscatedCode.match(stringArrayVariantRegExps[variantIndex])) {
                            stringArrayVariantMatchesLength[variantIndex]++;
                        }

                        if (obfuscatedCode.match(literalNodeVariantRegExps[variantIndex])) {
                            literalNodeVariantMatchesLength[variantIndex]++;
                        }
                    }
                }

                for (let variantIndex = 0; variantIndex < variantsCount; variantIndex++) {
                    stringArrayVariantProbabilities[variantIndex] = stringArrayVariantMatchesLength[variantIndex] / samples;
                    literalNodeVariantProbabilities[variantIndex] = literalNodeVariantMatchesLength[variantIndex] / samples;
                }

            });

            for (let variantIndex = 0; variantIndex < variantsCount; variantIndex++) {
                const variantNumber: number = variantIndex + 1;

                it(`Variant #${variantNumber}: should create string array variant`, () => {
                    assert.closeTo(stringArrayVariantProbabilities[variantIndex], expectedVariantProbability, delta);
                });

                it(`Variant #${variantNumber}: should replace literal node with call to string array variant`, () => {
                    assert.closeTo(literalNodeVariantProbabilities[variantIndex], expectedVariantProbability, delta);
                });
            }
        });
    });
});
