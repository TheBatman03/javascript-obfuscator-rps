import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { ICustomNode } from "../interfaces/custom-nodes/ICustomNode";
import { IOptions } from "../interfaces/IOptions";

import { NodeType } from "../enums/NodeType";

import { AbstractNodeObfuscator } from './AbstractNodeObfuscator';
import { IdentifierReplacer } from "./replacers/IdentifierReplacer";
import { Nodes } from "../Nodes";
import { NodeUtils } from "../NodeUtils";

/**
 * replaces:
 *     try {} catch (e) { console.log(e); };
 *
 * on:
 *     try {} catch (_0x12d45f) { console.log(_0x12d45f); };
 *
 */
export class CatchClauseObfuscator extends AbstractNodeObfuscator {
    /**
     * @type {IdentifierReplacer}
     */
    private identifierReplacer: IdentifierReplacer;

    /**
     * @param nodes
     * @param options
     */
    constructor(nodes: Map <string, ICustomNode>, options: IOptions) {
        super(nodes, options);

        this.identifierReplacer = new IdentifierReplacer(this.nodes, this.options);
    }

    /**
     * @param catchClauseNode
     */
    public obfuscateNode (catchClauseNode: ESTree.CatchClause): void {
        this.storeCatchClauseParam(catchClauseNode);
        this.replaceCatchClauseParam(catchClauseNode);
    }

    /**
     * @param catchClauseNode
     */
    private storeCatchClauseParam (catchClauseNode: ESTree.CatchClause): void {
        NodeUtils.typedReplace(catchClauseNode.param, NodeType.Identifier, {
            leave: (node: ESTree.Identifier) => this.identifierReplacer.storeNames(node.name)
        });
    }

    /**
     * @param catchClauseNode
     */
    private replaceCatchClauseParam (catchClauseNode: ESTree.CatchClause): void {
        estraverse.replace(catchClauseNode, {
            leave: (node: ESTree.Node, parentNode: ESTree.Node): any => {
                if (Nodes.isReplaceableIdentifierNode(node, parentNode)) {
                    node.name = this.identifierReplacer.replace(node.name);
                }
            }
        });
    }
}
