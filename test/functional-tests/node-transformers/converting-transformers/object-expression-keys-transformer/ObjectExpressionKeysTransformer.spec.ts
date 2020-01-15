import { assert } from 'chai';

import { NO_ADDITIONAL_NODES_PRESET } from '../../../../../src/options/presets/NoCustomNodes';

import { readFileAsString } from '../../../../helpers/readFileAsString';

import { JavaScriptObfuscator } from '../../../../../src/JavaScriptObfuscatorFacade';

describe('ObjectExpressionKeysTransformer', () => {
    const variableMatch: string = '_0x([a-f0-9]){4,6}';

    describe('transformation of object keys', () => {
        describe('Variant #1: simple', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #2: variable declaration without initialization', () => {
            const match: string = `` +
                `var *${variableMatch};` +
                `${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/variable-declaration-without-initialization.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #3: return statement', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
                `return *${variableMatch};` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/return-statement.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('shouldn transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #4: object expression inside array expression', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
                `var *${variableMatch} *= *\\[${variableMatch}];` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/object-expression-inside-array-expression.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('shouldn transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #5: object expression inside call expression', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
                `console\\['log']\\(${variableMatch}\\);` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/object-expression-inside-call-expression.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('shouldn transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #6: nested objects #1', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['inner'] *= *{};` +
                `${variableMatch}\\['inner']\\['inner1'] *= *{};` +
                `${variableMatch}\\['inner']\\['inner1']\\['baz'] *= *'bark';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/nested-objects-1.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #7: nested objects #2', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['inner'] *= *{};` +
                `${variableMatch}\\['ball'] *= *'door';` +
                `${variableMatch}\\['inner']\\['baz'] *= *'bark';` +
                `${variableMatch}\\['inner']\\['inner1'] *= *{};` +
                `${variableMatch}\\['inner']\\['cow'] *= *'bear';` +
                `${variableMatch}\\['inner']\\['inner1']\\['hawk'] *= *'geek';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/nested-objects-2.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #8: nested objects #3', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['hawk'] *= *'geek';` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['baz'] *= *'bark';` +
                `${variableMatch}\\['inner1'] *= *${variableMatch};` +
                `${variableMatch}\\['cow'] *= *'bear';` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['inner'] *= *${variableMatch};` +
                `${variableMatch}\\['ball'] *= *'door';` +
                `return ${variableMatch};` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/nested-objects-3.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #9: correct integration with control flow flattening object #1', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['\\w{5}'] *= *function *\\(${variableMatch}, *${variableMatch}\\) *{` +
                    `return *${variableMatch} *\\+ *${variableMatch};` +
                `};` +
                `var *${variableMatch} *= *${variableMatch}\\['\\w{5}']\\(0x1, *0x2\\);` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/integration-with-control-flow-flattening-1.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        controlFlowFlattening: true,
                        controlFlowFlatteningThreshold: 1,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #10: correct integration with control flow flattening object #2', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['\\w{5}'] *= *function *\\(${variableMatch}, *${variableMatch}\\) *{` +
                    `return *${variableMatch} *\\+ *${variableMatch};` +
                `};` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *0x1;` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['bar'] *= *0x2;` +
                `var *${variableMatch} *= *${variableMatch}\\['\\w{5}']\\(${variableMatch}\\['foo'], *${variableMatch}\\['bar']\\);` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/integration-with-control-flow-flattening-2.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        controlFlowFlattening: true,
                        controlFlowFlatteningThreshold: 1,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #11: variable declarator object call inside other variable declarator', () => {
            describe('Variant #1', () => {
                const match: string = `` +
                    `var *${variableMatch} *= *{};` +
                    `${variableMatch}\\['foo'] *= *'foo';` +
                    `var *${variableMatch} *= *${variableMatch}, *` +
                    `${variableMatch} *= *${variableMatch}\\['foo'];` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/variable-declarator-with-object-call-4.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #2', () => {
                const match: string = `` +
                    `var *${variableMatch} *= *{};` +
                    `${variableMatch}\\['foo'] *= *'foo';` +
                    `var *${variableMatch} *= *${variableMatch}, *` +
                    `${variableMatch} *= *\\[${variableMatch}\\['foo']];` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/variable-declarator-with-object-call-5.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });
        });

        describe('Variant #12: assignment expression and member expression', () => {
            const match: string = `` +
                `var ${variableMatch}; *` +
                `var ${variableMatch} *= *{}; *` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `\\(${variableMatch} *= *${variableMatch}\\)\\['baz'] *= *${variableMatch}\\['foo'];` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/assignment-expression-and-member-expression.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #13: should keep numeric object keys', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['0'] *= *'foo';` +
                `${variableMatch}\\['bar'] *= *'bar';` +
                `${variableMatch}\\['2'] *= *'baz';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/numeric-keys.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });
    });

    describe('member expression as host of object expression', () => {
        describe('Variant #1: simple', () => {
            const match: string = `` +
                `this\\['state'] *= *{};` +
                `this\\['state']\\['foo'] *= *'bar';` +
                `this\\['state']\\['baz'] *= *'bark';` +
                ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/member-expression-host-1.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #2: long members chain', () => {
            const match: string = `` +
                `this\\['state']\\['foo'] *= *{};` +
                `this\\['state']\\['foo']\\['foo'] *= *'bar';` +
                `this\\['state']\\['foo']\\['baz'] *= *'bark';` +
                ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/member-expression-host-2.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });
    });

    describe('correct placement of expression statements', () => {
        describe('Variant #1: if statement', () => {
            describe('Variant #1: with block statement', () => {
                const match: string = `` +
                    `if *\\(!!\\[]\\) *{` +
                    `var *${variableMatch} *= *{};` +
                    `${variableMatch}\\['foo'] *= *'bar';` +
                    `}` +
                    ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-if-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #2: without block statement', () => {
                const match: string = `` +
                    `var ${variableMatch};` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['baz'] *= *'baz';` +
                    `if *\\(!!\\[]\\)` +
                        `${variableMatch} *= *${variableMatch};` +
                    `else *` +
                        `${variableMatch} *= *${variableMatch};` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-if-statement-without-block-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #3: inside condition', () => {
                const match: string = `` +
                    `var ${variableMatch};` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `if *\\(${variableMatch} *= *${variableMatch}\\) *{}` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-if-statement-condition.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });
        });

        describe('Variant #2: for statement', () => {
            describe('Variant #1: with block statement', () => {
                const match: string = `` +
                    `for *\\(var *${variableMatch} *= *0x0; *${variableMatch} *< *0xa; *${variableMatch}\\+\\+\\) *{` +
                        `var *${variableMatch} *= *{};` +
                        `${variableMatch}\\['foo'] *= *'bar';` +
                    `}` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-for-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #2: without block statement', () => {
                const match: string = `` +
                    `var ${variableMatch};` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `for *\\(var *${variableMatch} *= *0x0; *${variableMatch} *< *0xa; *${variableMatch}\\+\\+\\) *` +
                        `${variableMatch} *= *${variableMatch};` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-for-statement-without-block-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });
        });

        describe('Variant #3: for in statement', () => {
            describe('Variant #1: with block statement', () => {
                const match: string = `` +
                    `var ${variableMatch} *= *{};` +
                    `for *\\(var *${variableMatch} in *${variableMatch}\\) *{` +
                        `${variableMatch} *= *{};` +
                        `${variableMatch}\\['bar'] *= *'bar';` +
                    `}` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-for-in-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #2: without block statement', () => {
                const match: string = `` +
                    `var ${variableMatch} *= *{};` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `for *\\(var *${variableMatch} in *${variableMatch}\\) *` +
                        `${variableMatch} *= *${variableMatch};` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-for-in-statement-without-block-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });
        });

        describe('Variant #4: for of statement', () => {
            describe('Variant #1: with block statement', () => {
                const match: string = `` +
                    `var ${variableMatch} *= *\\[];` +
                    `for *\\(var *${variableMatch} of *${variableMatch}\\) *{` +
                        `${variableMatch} *= *{};` +
                        `${variableMatch}\\['bar'] *= *'bar';` +
                    `}` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-for-of-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #2: without block statement', () => {
                const match: string = `` +
                    `var ${variableMatch} *= *\\[];` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `for *\\(var *${variableMatch} of *${variableMatch}\\) *` +
                        `${variableMatch} *= *${variableMatch};` +
                    ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-for-of-statement-without-block-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });
        });

        describe('Variant #5: while statement', () => {
            describe('Variant #1: with block statement', () => {
                const match: string = `` +
                    `while *\\(!!\\[]\\) *{` +
                        `var *${variableMatch} *= *{};` +
                        `${variableMatch}\\['foo'] *= *'bar';` +
                    `}` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-while-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #2: without block statement', () => {
                const match: string = `` +
                    `var ${variableMatch};` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `while *\\(!!\\[]\\)` +
                        `${variableMatch} *= *${variableMatch};` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-while-statement-without-block-statement.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #3: inside condition', () => {
                const match: string = `` +
                    `var ${variableMatch};` +
                    `var ${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `while *\\(${variableMatch} *= *${variableMatch}\\) *{}` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-while-statement-condition.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });
        });

        describe('Variant #6: try statement', () => {
            const match: string = `` +
                `try *{` +
                    `var *${variableMatch} *= *{};` +
                    `${variableMatch}\\['foo'] *= *'bar';` +
                `} *catch *\\(${variableMatch}\\) *{` +
                `}` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-try-statement.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #7: catch clause statement', () => {
            const match: string = `` +
                `try *{` +
                `} *catch *\\(${variableMatch}\\) *{` +
                    `var *${variableMatch} *= *{};` +
                    `${variableMatch}\\['foo'] *= *'bar';` +
                `}` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-catch-clause.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should correctly transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #8: switch catch statement', () => {
            const match: string = `` +
                `switch *\\(!!\\[]\\) *{` +
                    `case *!!\\[]:` +
                        `var *${variableMatch} *= *{};` +
                        `${variableMatch}\\['foo'] *= *'bar';` +
                `}` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/placement-inside-switch-case.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #9: variable declarator with object call', () => {
            describe('Variant #1', () => {
                const match: string = `` +
                    `const *${variableMatch} *= *{}; *` +
                    `${variableMatch}\\['foo'] *= *'foo'; *` +
                    `const *${variableMatch} *= *${variableMatch}\\['foo'];` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/variable-declarator-with-object-call-1.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #2', () => {
                const match: string = `` +
                    `const *${variableMatch} *= *0x1, *` +
                        `${variableMatch} *= *{}; *` +
                    `${variableMatch}\\['foo'] *= *'foo'; *` +
                    `const *${variableMatch} *= *${variableMatch}\\['foo'];` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/variable-declarator-with-object-call-2.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform object keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });

            describe('Variant #3: two objects', () => {
                const match: string = `` +
                    `var *${variableMatch} *= *{};` +
                    `${variableMatch}\\['bar'] *= *'bar';` +
                    `var *${variableMatch} *= *{}, *` +
                        `${variableMatch} *= *${variableMatch}, *` +
                        `${variableMatch} *= *${variableMatch}\\['bar']; *` +
                    `${variableMatch}\\['foo'] *= *'foo';` +
                    `console\\['log']\\(${variableMatch}\\);` +
                ``;
                const regExp: RegExp = new RegExp(match);

                let obfuscatedCode: string;

                before(() => {
                    const code: string = readFileAsString(__dirname + '/fixtures/variable-declarator-with-object-call-3.js');

                    obfuscatedCode = JavaScriptObfuscator.obfuscate(
                        code,
                        {
                            ...NO_ADDITIONAL_NODES_PRESET,
                            transformObjectKeys: true
                        }
                    ).getObfuscatedCode();
                });

                it('should correctly transform objects keys', () => {
                    assert.match(obfuscatedCode,  regExp);
                });
            });
        });
    });

    describe('prevailing kind of variables', () => {
        describe('Variant #1: `var` kind`', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/prevailing-kind-of-variables-var.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should use correct kind of variables', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #2: `const` kind`', () => {
            const match: string = `` +
                `const *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/prevailing-kind-of-variables-const.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should use correct kind of variables', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #3: `let` kind`', () => {
            const match: string = `` +
                `const *${variableMatch} *= *{};` +
                `${variableMatch}\\['foo'] *= *'bar';` +
                `${variableMatch}\\['baz'] *= *'bark';` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/prevailing-kind-of-variables-let.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        transformObjectKeys: true
                    }
                ).getObfuscatedCode();
            });

            it('should use correct kind of variables', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });
    });

    describe('Ignore transformation', () => {
        describe('Variant #1: disabled option', () => {
            const match: string = `` +
                `var *${variableMatch} *= *{` +
                    `'foo': *'bar',` +
                    `'baz': *'bark'` +
                `}` +
            ``;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/simple.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET
                    }
                ).getObfuscatedCode();
            });

            it('shouldn\'t transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });

        describe('Variant #2: empty object expression', () => {
            const match: string = `var *${variableMatch} *= *{};`;
            const regExp: RegExp = new RegExp(match);

            let obfuscatedCode: string;

            before(() => {
                const code: string = readFileAsString(__dirname + '/fixtures/empty-object-expression.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET
                    }
                ).getObfuscatedCode();
            });

            it('shouldn\'t transform object keys', () => {
                assert.match(obfuscatedCode,  regExp);
            });
        });
    });
});
