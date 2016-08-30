import { IArrowFunctionExpressionNode } from "./interfaces/nodes/IArrowFunctionExpressionNode";
import { IBlockStatementNode } from "./interfaces/nodes/IBlockStatementNode";
import { IIdentifierNode } from "./interfaces/nodes/IIdentifierNode";
import { IFunctionDeclarationNode } from "./interfaces/nodes/IFunctionDeclarationNode";
import { IFunctionExpressionNode } from "./interfaces/nodes/IFunctionExpressionNode";
import { ILiteralNode } from "./interfaces/nodes/ILiteralNode";
import { IMemberExpressionNode } from "./interfaces/nodes/IMemberExpressionNode";
import { INode } from "./interfaces/nodes/INode";
import { IProgramNode } from "./interfaces/nodes/IProgramNode";
import { IPropertyNode } from "./interfaces/nodes/IPropertyNode";
import { IVariableDeclarationNode } from "./interfaces/nodes/IVariableDeclarationNode";
import { IVariableDeclaratorNode } from "./interfaces/nodes/IVariableDeclaratorNode";

import { TStatement } from "./types/nodes/TStatement";

import { TNodeWithBlockStatement } from "./types/TNodeWithBlockStatement";

import { NodeType } from "./enums/NodeType";

export class Nodes {
    /**
     * @param bodyNode
     * @returns IProgramNode
     */
    public static getProgramNode (bodyNode: TStatement[]): IProgramNode {
        return {
            'type': NodeType.Program,
            'body': bodyNode,
            'sourceType': 'script'
        };
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isArrowFunctionExpressionNode (node: INode): node is IArrowFunctionExpressionNode {
        return node.type === NodeType.ArrowFunctionExpression;
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isBlockStatementNode (node: INode): node is IBlockStatementNode {
        return node.type === NodeType.BlockStatement;
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isFunctionDeclarationNode (node: INode): node is IFunctionDeclarationNode {
        return node.type === NodeType.FunctionDeclaration;
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isFunctionExpressionNode (node: INode): node is IFunctionExpressionNode {
        return node.type === NodeType.FunctionExpression;
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isIdentifierNode (node: INode): node is IIdentifierNode {
        return node.type === NodeType.Identifier;
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isLiteralNode (node: INode): node is ILiteralNode {
        return node.type === NodeType.Literal;
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isMemberExpressionNode (node: INode): node is IMemberExpressionNode {
        return node.type === NodeType.MemberExpression;
    }

    /**
     *
     * @param node
     * @returns {boolean}
     */
    public static isProgramNode (node: INode): node is IProgramNode {
        return node.type === NodeType.Program;
    }

    /**
     *
     * @param node
     * @returns {boolean}
     */
    public static isPropertyNode (node: INode): node is IPropertyNode {
        return node.type === NodeType.Property;
    }

    /**
     * @param node
     * @param parentNode
     * @returns {boolean}
     */
    public static isReplaceableIdentifierNode (node: INode, parentNode: INode): node is IIdentifierNode {
        if (!Nodes.isIdentifierNode(node)) {
            return false;
        }

        const parentNodeIsPropertyNode: boolean = Nodes.isPropertyNode(parentNode) && parentNode.key === node;
        const parentNodeIsMemberExpressionNode: boolean = (
            Nodes.isMemberExpressionNode(parentNode) &&
            parentNode.computed === false &&
            parentNode.property === node
        );

        return !parentNodeIsPropertyNode && !parentNodeIsMemberExpressionNode;
    }

    /**
     *
     * @param node
     * @returns {boolean}
     */
    public static isVariableDeclarationNode (node: INode): node is IVariableDeclarationNode {
        return node.type === NodeType.VariableDeclaration;
    }

    /**
     *
     * @param node
     * @returns {boolean}
     */
    public static isVariableDeclaratorNode (node: INode): node is IVariableDeclaratorNode {
        return node.type === NodeType.VariableDeclarator;
    }

    /**
     * @param node
     * @returns {boolean}
     */
    public static isNodeHasBlockStatement (node: INode): node is TNodeWithBlockStatement {
        return node.hasOwnProperty('body') && Array.isArray((<TNodeWithBlockStatement>node).body);
    }
}
