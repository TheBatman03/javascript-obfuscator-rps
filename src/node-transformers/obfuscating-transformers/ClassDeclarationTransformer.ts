import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { TIdentifierObfuscatingReplacerFactory } from "../../types/container/node-transformers/TIdentifierObfuscatingReplacerFactory";
import { TNodeWithBlockScope } from '../../types/node/TNodeWithBlockScope';

import { IIdentifierObfuscatingReplacer } from '../../interfaces/node-transformers/obfuscating-transformers/obfuscating-replacers/IIdentifierObfuscatingReplacer';
import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';
import { IVisitor } from '../../interfaces/node-transformers/IVisitor';

import { IdentifierObfuscatingReplacer } from "../../enums/node-transformers/obfuscating-transformers/obfuscating-replacers/IdentifierObfuscatingReplacer";
import { NodeType } from '../../enums/node/NodeType';
import { TransformationStage } from '../../enums/node-transformers/TransformationStage';

import { AbstractNodeTransformer } from '../AbstractNodeTransformer';
import { NodeGuards } from '../../node/NodeGuards';
import { NodeMetadata } from '../../node/NodeMetadata';
import { NodeUtils } from '../../node/NodeUtils';

/**
 * replaces:
 *     class Foo { //... };
 *     new Foo();
 *
 * on:
 *     class _0x12d45f { //... };
 *     new _0x12d45f();
 */
@injectable()
export class ClassDeclarationTransformer extends AbstractNodeTransformer {
    /**
     * @type {IIdentifierObfuscatingReplacer}
     */
    private readonly identifierObfuscatingReplacer: IIdentifierObfuscatingReplacer;

    /**
     * @type {Map<ESTree.Node, ESTree.Identifier[]>}
     */
    private readonly replaceableIdentifiers: Map <ESTree.Node, ESTree.Identifier[]> = new Map();

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
     * @param {TransformationStage} transformationStage
     * @returns {IVisitor | null}
     */
    public getVisitor (transformationStage: TransformationStage): IVisitor | null {
        switch (transformationStage) {
            case TransformationStage.Obfuscating:
                return {
                    enter: (node: ESTree.Node, parentNode: ESTree.Node | null) => {
                        if (
                            parentNode
                            && NodeGuards.isClassDeclarationNode(node)
                            && !NodeGuards.isExportNamedDeclarationNode(parentNode)
                        ) {
                            return this.transformNode(node, parentNode);
                        }
                    }
                };

            default:
                return null;
        }
    }

    /**
     * @param {ClassDeclaration} classDeclarationNode
     * @param {NodeGuards} parentNode
     * @returns {NodeGuards}
     */
    public transformNode (classDeclarationNode: ESTree.ClassDeclaration, parentNode: ESTree.Node): ESTree.Node {
        const blockScopeNode: TNodeWithBlockScope = NodeUtils.getBlockScopeOfNode(classDeclarationNode);
        const isGlobalDeclaration: boolean = blockScopeNode.type === NodeType.Program;

        if (!this.options.renameGlobals && isGlobalDeclaration) {
            return classDeclarationNode;
        }

        this.storeClassName(classDeclarationNode, blockScopeNode, isGlobalDeclaration);

        // check for cached identifiers for current scope node. If exist - loop through them.
        if (this.replaceableIdentifiers.has(blockScopeNode)) {
            this.replaceScopeCachedIdentifiers(blockScopeNode);
        } else {
            this.replaceScopeIdentifiers(blockScopeNode);
        }

        return classDeclarationNode;
    }

    /**
     * @param {ClassDeclaration} classDeclarationNode
     * @param {TNodeWithBlockScope} blockScopeNode
     * @param {boolean} isGlobalDeclaration
     */
    private storeClassName (
        classDeclarationNode: ESTree.ClassDeclaration,
        blockScopeNode: TNodeWithBlockScope,
        isGlobalDeclaration: boolean
    ): void {
        if (isGlobalDeclaration) {
            this.identifierObfuscatingReplacer.storeGlobalName(classDeclarationNode.id.name, blockScopeNode);
        } else {
            this.identifierObfuscatingReplacer.storeLocalName(classDeclarationNode.id.name, blockScopeNode);
        }
    }

    /**
     * @param {TNodeWithBlockScope} blockScopeNode
     */
    private replaceScopeCachedIdentifiers (blockScopeNode: TNodeWithBlockScope): void {
        const cachedReplaceableIdentifiers: ESTree.Identifier[] =
            <ESTree.Identifier[]>this.replaceableIdentifiers.get(blockScopeNode);

        cachedReplaceableIdentifiers.forEach((replaceableIdentifier: ESTree.Identifier) => {
            const newReplaceableIdentifier: ESTree.Identifier = this.identifierObfuscatingReplacer
                .replace(replaceableIdentifier.name, blockScopeNode);

            replaceableIdentifier.name = newReplaceableIdentifier.name;
            NodeMetadata.set(replaceableIdentifier, { renamedIdentifier: true });
        });
    }

    /**
     * @param {TNodeWithBlockScope} blockScopeNode
     */
    private replaceScopeIdentifiers (blockScopeNode: TNodeWithBlockScope): void {
        const storedReplaceableIdentifiers: ESTree.Identifier[] = [];

        estraverse.replace(blockScopeNode, {
            enter: (node: ESTree.Node, parentNode: ESTree.Node | null): void => {
                if (
                    parentNode
                    && NodeGuards.isReplaceableIdentifierNode(node, parentNode)
                    && !NodeMetadata.isRenamedIdentifier(node)
                ) {
                    const newIdentifier: ESTree.Identifier = this.identifierObfuscatingReplacer
                        .replace(node.name, blockScopeNode);
                    const newIdentifierName: string = newIdentifier.name;

                    if (node.name !== newIdentifierName) {
                        node.name = newIdentifierName;
                        NodeMetadata.set(node, { renamedIdentifier: true });
                    } else {
                        storedReplaceableIdentifiers.push(node);
                    }
                }
            }
        });

        this.replaceableIdentifiers.set(blockScopeNode, storedReplaceableIdentifiers);
    }
}
