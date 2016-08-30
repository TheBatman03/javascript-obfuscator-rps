import * as estraverse from 'estraverse';

import { IFunctionNode } from "../interfaces/nodes/IFunctionNode";
import { INode } from "../interfaces/nodes/INode";

import { AbstractNodeObfuscator } from './AbstractNodeObfuscator';
import { IdentifierReplacer } from "./replacers/IdentifierReplacer";
import { Nodes } from "../Nodes";

/**
 * replaces:
 *     function foo (argument1) { return argument1; };
 *
 * on:
 *     function foo (_0x12d45f) { return _0x12d45f; };
 *
 */
export class FunctionObfuscator extends AbstractNodeObfuscator {
    /**
     * @type {Map<string, string>}
     */
    private functionParams: Map <string, string> = new Map <string, string> ();

    /**
     * @param functionNode
     */
    public obfuscateNode (functionNode: IFunctionNode): void {
        this.storeFunctionParams(functionNode);
        this.replaceFunctionParams(functionNode);
    }

    /**
     * @param functionNode
     */
    private storeFunctionParams (functionNode: IFunctionNode): void {
        functionNode.params
            .forEach((paramsNode: INode) => {
                estraverse.traverse(paramsNode, {
                    leave: (node: INode): any => this.storeIdentifiersNames(node, this.functionParams)
                });
            });
    }

    /**
     * @param functionNode
     */
    private replaceFunctionParams (functionNode: IFunctionNode): void {
        let replaceVisitor: estraverse.Visitor = {
            leave: (node: INode, parentNode: INode): any => {
                if (Nodes.isReplaceableIdentifierNode(node, parentNode)) {
                    node.name = new IdentifierReplacer(this.nodes, this.options)
                        .replace(node.name, this.functionParams);
                }
            }
        };

        functionNode.params
            .forEach((paramsNode: INode) => {
                estraverse.replace(paramsNode, replaceVisitor);
            });

        estraverse.replace(functionNode.body, replaceVisitor);
    }
}
