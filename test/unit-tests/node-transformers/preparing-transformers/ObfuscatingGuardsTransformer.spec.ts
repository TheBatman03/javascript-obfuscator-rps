import 'reflect-metadata';

import { assert } from 'chai';

import * as ESTree from 'estree';

import { ServiceIdentifiers } from '../../../../src/container/ServiceIdentifiers';
import { InversifyContainerFacade } from '../../../../src/container/InversifyContainerFacade';

import { IInversifyContainerFacade } from '../../../../src/interfaces/container/IInversifyContainerFacade';
import { INodeTransformer } from '../../../../src/interfaces/node-transformers/INodeTransformer';

import { NodeTransformer } from '../../../../src/enums/node-transformers/NodeTransformer';
import { NodeFactory } from '../../../../src/node/NodeFactory';
import { NodeMetadata } from '../../../../src/node/NodeMetadata';
import { NodeUtils } from '../../../../src/node/NodeUtils';

describe('ObfuscatingGuardsTransformer', () => {
    describe('transformNode', () => {
        const forceTransformString: string = 'important string';
        const ignoredAndForceTransformString: string = 'important ignored string';

        let inversifyContainerFacade: IInversifyContainerFacade,
            obfuscatingGuardsTransformer: INodeTransformer;

        before(() => {
            inversifyContainerFacade = new InversifyContainerFacade();
            inversifyContainerFacade.load('', '', {
                forceTransformStrings: [
                    forceTransformString,
                    ignoredAndForceTransformString
                ],
                reservedStrings: [
                    ignoredAndForceTransformString
                ]
            });

            obfuscatingGuardsTransformer = inversifyContainerFacade
                .getNamed(ServiceIdentifiers.INodeTransformer, NodeTransformer.ObfuscatingGuardsTransformer);
        });

        describe('Variant #1: allowed node', () => {
            const identifier: ESTree.Identifier = NodeFactory.identifierNode('foo');

            const expectedResult: ESTree.Identifier = NodeUtils.clone(identifier);

            let result: ESTree.Identifier;

            before(() => {
                identifier.parentNode = identifier;

                NodeMetadata.set(expectedResult, {
                    forceTransformNode: false,
                    ignoredNode: false
                });

                result = <ESTree.Identifier>obfuscatingGuardsTransformer.transformNode(identifier, identifier);
            });

            it('should add `ignoredNode` property with `false` value to given node', () => {
                assert.deepEqual(result, expectedResult);
            });
        });

        describe('Variant #2: ignored node', () => {
            const expressionStatement: ESTree.ExpressionStatement = NodeFactory.directiveNode(
                NodeFactory.literalNode('use strict'),
                'use strict'
            );

            const expectedResult: ESTree.ExpressionStatement = NodeUtils.clone(expressionStatement);

            let result: ESTree.ExpressionStatement;

            before(() => {
                expressionStatement.parentNode = expressionStatement;
                expressionStatement.expression.parentNode = expressionStatement;

                expectedResult.parentNode = expectedResult;
                NodeMetadata.set(expectedResult, {
                    forceTransformNode: false,
                    ignoredNode: true
                });

                result = <ESTree.ExpressionStatement>obfuscatingGuardsTransformer
                    .transformNode(expressionStatement, expressionStatement);
            });

            it('should add `ignoredNode` property with `true` value to given node', () => {
                assert.deepEqual(result, expectedResult);
            });
        });

        describe('Variant #3: force transform node', () => {
            const literalNode: ESTree.Literal =  NodeFactory.literalNode(forceTransformString);

            const expectedResult: ESTree.Literal = NodeUtils.clone(literalNode);

            let result: ESTree.Literal;

            before(() => {
                literalNode.parentNode = literalNode;

                expectedResult.parentNode = expectedResult;
                NodeMetadata.set(expectedResult, {
                    forceTransformNode: true,
                    ignoredNode: false
                });

                result = <ESTree.Literal>obfuscatingGuardsTransformer
                    .transformNode(literalNode, literalNode);
            });

            it('should add `forceTransformNode` property with `true` value to given node', () => {
                assert.deepEqual(result, expectedResult);
            });
        });

        describe('Variant #4: ignored node and force transform node', () => {
            const literalNode: ESTree.Literal = NodeFactory.literalNode(ignoredAndForceTransformString);

            const expectedResult: ESTree.Literal = NodeUtils.clone(literalNode);

            let result: ESTree.Literal;

            before(() => {
                literalNode.parentNode = literalNode;

                expectedResult.parentNode = expectedResult;
                NodeMetadata.set(expectedResult, {
                    forceTransformNode: true,
                    ignoredNode: false
                });

                result = <ESTree.Literal>obfuscatingGuardsTransformer
                    .transformNode(literalNode, literalNode);
            });

            it('should add correct metadata to given node', () => {
                assert.deepEqual(result, expectedResult);
            });
        });
    });
});
