import * as esprima from 'esprima';

import { INode } from "../../interfaces/nodes/INode";
import { IOptions } from "../../interfaces/IOptions";

import { TBlockScopeNode } from "../../types/TBlockScopeNode";

import { AppendState } from "../../enums/AppendState";

import { NO_CUSTOM_NODES_PRESET } from "../../preset-options/NoCustomNodesPreset";

import { JavaScriptObfuscator } from "../../JavaScriptObfuscator";
import { Node } from '../Node';
import { NodeUtils } from "../../NodeUtils";
import { Utils } from "../../Utils";

export class UnicodeArrayRotateFunctionNode extends Node {
    /**
     * @type {AppendState}
     */
    protected appendState: AppendState = AppendState.AfterObfuscation;

    /**
     * @type {string[]}
     */
    private unicodeArray: string[];

    /**
     * @type {string}
     */
    private unicodeArrayName: string;

    /**
     * @param {number}
     */
    private unicodeArrayRotateValue: number;

    /**
     * @param unicodeArrayName
     * @param unicodeArray
     * @param unicodeArrayRotateValue
     * @param options
     */
    constructor (
        unicodeArrayName: string,
        unicodeArray: string[],
        unicodeArrayRotateValue: number,
        options: IOptions = {}
    ) {
        super(options);

        this.unicodeArrayName = unicodeArrayName;
        this.unicodeArray = unicodeArray;
        this.unicodeArrayRotateValue = unicodeArrayRotateValue;

        this.node = this.getNodeStructure();
    }

    /**
     * @param blockScopeNode
     */
    public appendNode (blockScopeNode: TBlockScopeNode): void {
        NodeUtils.insertNodeAtIndex(blockScopeNode.body, this.getNode(), 1);
    }

    /**
     * @returns {INode}
     */
    public getNode (): INode {
        if (!this.unicodeArray.length) {
            return;
        }

        return super.getNode();
    }

    /**
     * @returns {INode}
     */
    protected getNodeStructure (): INode {
        let arrayName: string = Utils.getRandomVariableName(),
            code: string = '',
            timesName: string = Utils.getRandomVariableName(),
            tempArrayName: string = Utils.getRandomVariableName(),
            node: INode;

        if (this.options['selfDefending']) {
            code = JavaScriptObfuscator.obfuscate(`
                (function () {
                    var func = function () {
                        return '\x77\x69\x6e\x64\x6f\x77';
                    };
                                        
                    if (
                        !/(\\\\\[x|u](\\w){2,4})+/.test(func.toString())
                    ) {
                        []["filter"]["constructor"]((+(32))["toString"](33) + (+(101))["toString"](21)[1] + ([false]+undefined)[10] + (false+"")[2] + (true+"")[3] + '(!![]){}')();
                    }
                })();
            `, NO_CUSTOM_NODES_PRESET);
        }

        node = esprima.parse(`
            (function (${arrayName}, ${timesName}) {
                if (${timesName} < 0x${Utils.decToHex(0)}) {
                    return;
                }

                var ${tempArrayName};

                while (${timesName}--) {
                    ${code}
                    ${tempArrayName} = ${arrayName}[${Utils.stringToUnicode('shift')}]();
                    ${arrayName}[${Utils.stringToUnicode('push')}](${tempArrayName});
                }
            })(${this.unicodeArrayName}, 0x${Utils.decToHex(this.unicodeArrayRotateValue)});
        `);

        NodeUtils.addXVerbatimPropertyToLiterals(node);

        return NodeUtils.getBlockScopeNodeByIndex(node);
    }
}
