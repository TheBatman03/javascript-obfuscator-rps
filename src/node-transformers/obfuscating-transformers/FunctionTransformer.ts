import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { TIdentifierObfuscatingReplacerFactory } from '../../types/container/node-transformers/TIdentifierObfuscatingReplacerFactory';
import { TNodeWithLexicalScope } from '../../types/node/TNodeWithLexicalScope';

import { IIdentifierObfuscatingReplacer } from '../../interfaces/node-transformers/obfuscating-transformers/obfuscating-replacers/IIdentifierObfuscatingReplacer';
import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';
import { IVisitor } from '../../interfaces/node-transformers/IVisitor';

import { IdentifierObfuscatingReplacer } from '../../enums/node-transformers/obfuscating-transformers/obfuscating-replacers/IdentifierObfuscatingReplacer';
import { TransformationStage } from '../../enums/node-transformers/TransformationStage';

import { AbstractNodeTransformer } from '../AbstractNodeTransformer';
import { NodeGuards } from '../../node/NodeGuards';
import { NodeLexicalScopeUtils } from '../../node/NodeLexicalScopeUtils';
import { NodeMetadata } from '../../node/NodeMetadata';

/**
 * replaces:
 *     function foo (argument1) { return argument1; };
 *
 * on:
 *     function foo (_0x12d45f) { return _0x12d45f; };
 *
 */
@injectable()
export class FunctionTransformer extends AbstractNodeTransformer {
    /**
     * @type {IIdentifierObfuscatingReplacer}
     */
    private readonly identifierObfuscatingReplacer: IIdentifierObfuscatingReplacer;

    /**
     * @param {TIdentifierObfuscatingReplacerFactory} identifierObfuscatingReplacerFactory
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    constructor (
        @inject(ServiceIdentifiers.Factory__IIdentifierObfuscatingReplacer)
            identifierObfuscatingReplacerFactory: TIdentifierObfuscatingReplacerFactory,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(randomGenerator, options);

        this.identifierObfuscatingReplacer = identifierObfuscatingReplacerFactory(
            IdentifierObfuscatingReplacer.BaseIdentifierObfuscatingReplacer
        );
    }

    /**
     * @param {Node} node
     * @param {Node} parentNode
     * @returns {boolean}
     */
    private static isProhibitedIdentifierOfPropertyNode (
        node: ESTree.Node,
        parentNode: ESTree.Node | null
    ): node is ESTree.Identifier {
        return NodeGuards.isIdentifierNode(node)
            && !!parentNode
            && NodeGuards.isPropertyNode(parentNode)
            && parentNode.key === node;
    }

    /**
     * @param {Node} node
     * @returns {boolean}
     */
    private static isProhibitedIdentifierOfShorthandPropertyNode (
        node: ESTree.Node,
    ): node is ESTree.Property & {key: ESTree.Identifier} {
        return NodeGuards.isPropertyNode(node)
            && node.shorthand
            && NodeGuards.isIdentifierNode(node.key);
    }

    /**
     * @param {TransformationStage} transformationStage
     * @returns {IVisitor | null}
     */
    public getVisitor (transformationStage: TransformationStage): IVisitor | null {
        switch (transformationStage) {
            case TransformationStage.Obfuscating:
                return {
                    enter: (node: ESTree.Node, parentNode: ESTree.Node | null) => {
                        if (parentNode && NodeGuards.isFunctionNode(node)) {
                            return this.transformNode(node, parentNode);
                        }
                    }
                };

            default:
                return null;
        }
    }

    /**
     * @param {Function} functionNode
     * @param {NodeGuards} parentNode
     * @returns {NodeGuards}
     */
    public transformNode (functionNode: ESTree.Function, parentNode: ESTree.Node): ESTree.Node {
        const lexicalScopeNode: TNodeWithLexicalScope | undefined = NodeLexicalScopeUtils.getLexicalScope(functionNode);

        if (!lexicalScopeNode) {
            return functionNode;
        }

        this.storeFunctionParams(functionNode, lexicalScopeNode);
        this.replaceFunctionParams(functionNode, lexicalScopeNode);

        return functionNode;
    }

    /**
     * @param {Function} functionNode
     * @param {TNodeWithLexicalScope} lexicalScopeNode
     */
    private storeFunctionParams (functionNode: ESTree.Function, lexicalScopeNode: TNodeWithLexicalScope): void {
        functionNode.params
            .forEach((paramsNode: ESTree.Node) => {
                estraverse.traverse(paramsNode, {
                    enter: (node: ESTree.Node, parentNode: ESTree.Node | null): estraverse.VisitorOption | void => {
                        // Should check with identifier as first argument,
                        // because prohibited identifier can be easily ignored
                        if (FunctionTransformer.isProhibitedIdentifierOfPropertyNode(node, parentNode)) {
                            return;
                        }

                        if (NodeGuards.isAssignmentPatternNode(node) && NodeGuards.isIdentifierNode(node.left)) {
                            this.identifierObfuscatingReplacer.storeLocalName(node.left.name, lexicalScopeNode);

                            return estraverse.VisitorOption.Skip;
                        }

                        if (NodeGuards.isIdentifierNode(node)) {
                            this.identifierObfuscatingReplacer.storeLocalName(node.name, lexicalScopeNode);
                        }
                    }
                });
            });
    }

    /**
     * @param {Function} functionNode
     * @param {TNodeWithLexicalScope} lexicalScopeNode
     * @param {Set<string>} ignoredIdentifierNamesSet
     */
    private replaceFunctionParams (
        functionNode: ESTree.Function,
        lexicalScopeNode: TNodeWithLexicalScope,
        ignoredIdentifierNamesSet: Set <string> = new Set()
    ): void {
        const replaceVisitor: estraverse.Visitor = {
            enter: (node: ESTree.Node, parentNode: ESTree.Node | null): void | estraverse.VisitorOption => {
                /**
                 * Should skip function node itself
                 */
                if (node === functionNode) {
                    return;
                }

                /**
                 * Should process nested functions in different traverse loop to avoid wrong code generation
                 */
                if (NodeGuards.isFunctionNode(node)) {
                    this.replaceFunctionParams(node, lexicalScopeNode, new Set(ignoredIdentifierNamesSet));

                    return estraverse.VisitorOption.Skip;
                }

                /**
                 * Should ignore all shorthand `key` identifiers of the `PropertyNode`
                 */
                if (FunctionTransformer.isProhibitedIdentifierOfShorthandPropertyNode(node)) {
                    ignoredIdentifierNamesSet.add(node.key.name);

                    return;
                }

                if (
                    parentNode
                    && NodeGuards.isReplaceableIdentifierNode(node, parentNode)
                    && !ignoredIdentifierNamesSet.has(node.name)
                ) {
                    const newIdentifier: ESTree.Identifier = this.identifierObfuscatingReplacer
                        .replace(node.name, lexicalScopeNode);
                    const newIdentifierName: string = newIdentifier.name;

                    if (node.name !== newIdentifierName) {
                        node.name = newIdentifierName;
                        NodeMetadata.set(node, { renamedIdentifier: true });
                    }
                }
            }
        };

        estraverse.replace(functionNode, replaceVisitor)
    }
}
