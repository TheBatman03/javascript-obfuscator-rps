import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as eslintScope from 'eslint-scope';
import * as ESTree from 'estree';
import * as estraverse from 'estraverse';

import { TIdentifierObfuscatingReplacerFactory } from '../../types/container/node-transformers/TIdentifierObfuscatingReplacerFactory';

import { IIdentifierObfuscatingReplacer } from '../../interfaces/node-transformers/obfuscating-transformers/obfuscating-replacers/IIdentifierObfuscatingReplacer';
import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';
import { IScopeAnalyzer } from '../../interfaces/analyzers/scope-analyzer/IScopeAnalyzer';
import { IVisitor } from '../../interfaces/node-transformers/IVisitor';

import { IdentifierObfuscatingReplacer } from '../../enums/node-transformers/obfuscating-transformers/obfuscating-replacers/IdentifierObfuscatingReplacer';
import { TransformationStage } from '../../enums/node-transformers/TransformationStage';

import { AbstractNodeTransformer } from '../AbstractNodeTransformer';
import { NodeGuards } from '../../node/NodeGuards';
import { NodeMetadata } from '../../node/NodeMetadata';

/**
 * Replaces all replaceable identifiers in scope
 */
@injectable()
export class ScopeIdentifiersTransformer extends AbstractNodeTransformer {
    /**
     * @type {string}
     */
    private static readonly argumentsVariableName: string = 'arguments';

    /**
     * @type {string[]}
     */
    private static readonly globalScopeNames: string[] = [
        'global',
        'module'
    ];

    /**
     * @type {IIdentifierObfuscatingReplacer}
     */
    private readonly identifierObfuscatingReplacer: IIdentifierObfuscatingReplacer;

    /**
     * @type {Map<eslintScope.Scope['block'], boolean>}
     */
    private readonly lexicalScopesWithObjectPatternWithoutDeclarationMap: Map<eslintScope.Scope['block'], boolean> = new Map();

    /**
     * @type {IScopeAnalyzer}
     */
    private readonly scopeAnalyzer: IScopeAnalyzer;

    /**
     * @param {TIdentifierObfuscatingReplacerFactory} identifierObfuscatingReplacerFactory
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     * @param {IScopeAnalyzer} scopeAnalyzer
     */
    constructor (
        @inject(ServiceIdentifiers.Factory__IIdentifierObfuscatingReplacer)
            identifierObfuscatingReplacerFactory: TIdentifierObfuscatingReplacerFactory,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions,
        @inject(ServiceIdentifiers.IScopeAnalyzer) scopeAnalyzer: IScopeAnalyzer
    ) {
        super(randomGenerator, options);

        this.identifierObfuscatingReplacer = identifierObfuscatingReplacerFactory(
            IdentifierObfuscatingReplacer.BaseIdentifierObfuscatingReplacer
        );
        this.scopeAnalyzer = scopeAnalyzer;
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
                        if (parentNode && NodeGuards.isProgramNode(node)) {
                            this.analyzeNode(node, parentNode);

                            return this.transformNode(node, parentNode);
                        }
                    }
                };

            default:
                return null;
        }
    }

    /**
     * @param {Program} programNode
     * @param {Node | null} parentNode
     * @returns {Node}
     */
    public analyzeNode (programNode: ESTree.Program, parentNode: ESTree.Node | null): void {
        this.scopeAnalyzer.analyze(programNode);
    }

    /**
     * @param {VariableDeclaration} programNode
     * @param {NodeGuards} parentNode
     * @returns {NodeGuards}
     */
    public transformNode (programNode: ESTree.Program, parentNode: ESTree.Node): ESTree.Node {
        const globalScope: eslintScope.Scope = this.scopeAnalyzer.acquireScope(programNode);

        this.traverseScopeVariables(globalScope);

        return programNode;
    }

    /**
     * @param {Scope} scope
     */
    private traverseScopeVariables (scope: eslintScope.Scope): void {
        const variableScope: eslintScope.Scope = scope.variableScope;
        const isGlobalVariableScope: boolean = ScopeIdentifiersTransformer.globalScopeNames.includes(variableScope.type);

        scope.variables.forEach((variable: eslintScope.Variable) => {
            this.processScopeVariableIdentifiers(variable, scope, variableScope, isGlobalVariableScope);
        });

        for (const childScope of scope.childScopes) {
            this.traverseScopeVariables(childScope);
        }
    }

    /**
     * @param {Variable} variable
     * @param {Scope} scope
     * @param {Scope} variableScope
     * @param {boolean} isGlobalVariableScope
     */
    private processScopeVariableIdentifiers (
        variable: eslintScope.Variable,
        scope: eslintScope.Scope,
        variableScope: eslintScope.Scope,
        isGlobalVariableScope: boolean
    ): void {
        if (variable.name === ScopeIdentifiersTransformer.argumentsVariableName) {
            return;
        }

        if (!this.options.renameGlobals && isGlobalVariableScope) {
            const isImportBindingOrCatchClauseIdentifier: boolean = variable.defs
                .every((definition: eslintScope.Definition) =>
                    definition.type === 'ImportBinding'
                    || definition.type === 'CatchClause'
                );

            // skip all global identifiers except import statement and catch clause identifiers
            if (!isImportBindingOrCatchClauseIdentifier) {
                return;
            }
        }

        for (const identifier of variable.identifiers) {
            if (!this.isReplaceableIdentifierNode(variable, identifier, variableScope.block)) {
                continue;
            }

            identifier.name = this.getNewIdentifierName(
                identifier,
                scope,
                variableScope,
                isGlobalVariableScope
            );

            // rename of references
            variable.references.forEach((reference: eslintScope.Reference) => {
                reference.identifier.name = identifier.name;
            });

            // rename of function default parameter identifiers if exists
            (<any>variable.scope.block).defaults?.forEach((node: ESTree.Node) => {
                if (NodeGuards.isIdentifierNode(node) && node.name === variable.name) {
                    node.name = identifier.name;
                }
            });
        }
    }

    /**
     * @param {Identifier} identifierNode
     * @param {Scope} scope
     * @param {Scope} variableScope
     * @param {boolean} isGlobalVariableScope
     * @returns {string}
     */
    private getNewIdentifierName (
        identifierNode: ESTree.Identifier,
        scope: eslintScope.Scope,
        variableScope: eslintScope.Scope,
        isGlobalVariableScope: boolean
    ): string {
        if (!identifierNode.parentNode || !NodeGuards.isNodeWithBlockLexicalScope(variableScope.block)) {
            return identifierNode.name;
        }

        // prevent class name renaming twice for outer scope and for class scope
        if (scope.type === 'class' && this.isClassDeclarationNameIdentifierNode(identifierNode, identifierNode.parentNode)) {
            return identifierNode.name;
        }

        isGlobalVariableScope
            ? this.identifierObfuscatingReplacer.storeGlobalName(identifierNode, variableScope.block)
            : this.identifierObfuscatingReplacer.storeLocalName(identifierNode, variableScope.block);

        return this.identifierObfuscatingReplacer.replace(identifierNode, variableScope.block).name;
    }

    /**
     * @param {Identifier} identifierNode
     * @param {Node} parentNode
     * @returns {identifierNode is Identifier}
     */
    private isClassDeclarationNameIdentifierNode (
        identifierNode: ESTree.Identifier,
        parentNode: ESTree.Node
    ): identifierNode is ESTree.Identifier {
        return NodeGuards.isClassDeclarationNode(parentNode)
            && parentNode.id === identifierNode;
    }

    /**
     * @param {Variable} variable
     * @param {Identifier} identifierNode
     * @param {Scope["block"]} lexicalScopeNode
     * @returns {boolean}
     */
    private isReplaceableIdentifierNode (
        variable: eslintScope.Variable,
        identifierNode: ESTree.Identifier,
        lexicalScopeNode: eslintScope.Scope['block']
    ): boolean {
        const parentNode: ESTree.Node | undefined = identifierNode.parentNode;

        return !!parentNode
            && !NodeMetadata.isIgnoredNode(identifierNode)
            && !this.isProhibitedPropertyNode(identifierNode, parentNode)
            && !this.isProhibitedExportNamedClassDeclarationIdentifierNode(identifierNode, parentNode)
            && !this.isProhibitedExportNamedFunctionDeclarationIdentifierNode(identifierNode, parentNode)
            && !this.isProhibitedExportNamedVariableDeclarationIdentifierNode(identifierNode, parentNode)
            && !this.isProhibitedImportSpecifierNode(identifierNode, parentNode)
            && !this.isProhibitedVariableNameUsedInObjectPatternNode(variable, identifierNode, lexicalScopeNode)
            && !NodeGuards.isLabelIdentifierNode(identifierNode, parentNode);
    }

    /**
     * @param {Identifier} identifierNode
     * @param {Node} parentNode
     * @returns {identifierNode is Identifier}
     */
    private isProhibitedExportNamedClassDeclarationIdentifierNode (
        identifierNode: ESTree.Identifier,
        parentNode: ESTree.Node
    ): identifierNode is ESTree.Identifier {
        return NodeGuards.isClassDeclarationNode(parentNode)
            && parentNode.id === identifierNode
            && !!parentNode.parentNode
            && NodeGuards.isExportNamedDeclarationNode(parentNode.parentNode);
    }

    /**
     * @param {Identifier} identifierNode
     * @param {Node} parentNode
     * @returns {identifierNode is Identifier}
     */
    private isProhibitedExportNamedFunctionDeclarationIdentifierNode (
        identifierNode: ESTree.Identifier,
        parentNode: ESTree.Node
    ): identifierNode is ESTree.Identifier {
        return NodeGuards.isFunctionDeclarationNode(parentNode)
            && parentNode.id === identifierNode
            && !!parentNode.parentNode
            && NodeGuards.isExportNamedDeclarationNode(parentNode.parentNode);
    }

    /**
     * @param {Identifier} identifierNode
     * @param {Node} parentNode
     * @returns {identifierNode is Identifier}
     */
    private isProhibitedExportNamedVariableDeclarationIdentifierNode (
        identifierNode: ESTree.Identifier,
        parentNode: ESTree.Node
    ): identifierNode is ESTree.Identifier {
        return NodeGuards.isVariableDeclaratorNode(parentNode)
            && parentNode.id === identifierNode
            && !!parentNode.parentNode
            && NodeGuards.isVariableDeclarationNode(parentNode.parentNode)
            && !!parentNode.parentNode.parentNode
            && NodeGuards.isExportNamedDeclarationNode(parentNode.parentNode.parentNode);
    }

    /**
     * @param {Identifier} identifierNode
     * @param {Node} parentNode
     * @returns {boolean}
     */
    private isProhibitedImportSpecifierNode (identifierNode: ESTree.Identifier, parentNode: ESTree.Node): boolean {
        return NodeGuards.isImportSpecifierNode(parentNode)
            && parentNode.imported.name === parentNode.local.name;
    }

    /**
     * @param {Node} node
     * @param {Node} parentNode
     * @returns {boolean}
     */
    private isProhibitedPropertyNode (node: ESTree.Node, parentNode: ESTree.Node): node is ESTree.Identifier {
        return NodeGuards.isPropertyNode(parentNode)
            && !parentNode.computed
            && parentNode.key === node;
    }

    /**
     * Should not rename identifiers that used inside destructing assignment without declaration
     *
     * var a, b; // should not be renamed
     * ({a, b} = {a: 1, b: 2});
     *
     * @param {Variable} variable
     * @param {Identifier} identifierNode
     * @param {eslintScope.Scope['block']} lexicalScopeNode
     * @returns {boolean}
     */
    private isProhibitedVariableNameUsedInObjectPatternNode (
        variable: eslintScope.Variable,
        identifierNode: ESTree.Identifier,
        lexicalScopeNode: eslintScope.Scope['block']
    ): boolean {
        let isLexicalScopeHasObjectPatternWithoutDeclaration: boolean | undefined =
            this.lexicalScopesWithObjectPatternWithoutDeclarationMap.get(lexicalScopeNode);

        // lexical scope was traversed before and object pattern without declaration was not found
        if (isLexicalScopeHasObjectPatternWithoutDeclaration === false) {
            return false;
        }

        const hasVarDefinitions: boolean = variable.defs.some((definition: eslintScope.Definition) => (<any>definition).kind === 'var');

        if (!hasVarDefinitions) {
            return false;
        }

        let isProhibitedVariableDeclaration: boolean = false;

        estraverse.traverse(lexicalScopeNode, {
            enter: (node: ESTree.Node, parentNode: ESTree.Node | null): void | estraverse.VisitorOption => {
                if (
                    NodeGuards.isObjectPatternNode(node)
                    && parentNode
                    && NodeGuards.isAssignmentExpressionNode(parentNode)
                ) {
                    isLexicalScopeHasObjectPatternWithoutDeclaration = true;

                    const properties: ESTree.Property[] = node.properties;

                    for (const property of properties) {
                        if (property.computed || !property.shorthand) {
                            continue;
                        }

                        if (!NodeGuards.isIdentifierNode(property.key)) {
                            continue;
                        }

                        if (identifierNode.name !== property.key.name) {
                            continue;
                        }

                        isProhibitedVariableDeclaration = true;

                        return estraverse.VisitorOption.Break;
                    }
                }
            }
        });

        this.lexicalScopesWithObjectPatternWithoutDeclarationMap.set(
            lexicalScopeNode,
            isLexicalScopeHasObjectPatternWithoutDeclaration ?? false
        );

        return isProhibitedVariableDeclaration;
    }
}
