import { injectable, inject } from 'inversify';
import { ServiceIdentifiers } from '../../../container/ServiceIdentifiers';

import { TCustomNodeFactory } from '../../../types/container/custom-nodes/TCustomNodeFactory';
import { TNodeWithBlockStatement } from '../../../types/node/TNodeWithBlockStatement';

import { ICustomNode } from '../../../interfaces/custom-nodes/ICustomNode';
import { IObfuscationEventEmitter } from '../../../interfaces/event-emitters/IObfuscationEventEmitter';
import { IOptions } from '../../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../../interfaces/utils/IRandomGenerator';
import { IStackTraceData } from '../../../interfaces/analyzers/stack-trace-analyzer/IStackTraceData';

import { initializable } from '../../../decorators/Initializable';

import { CustomNode } from '../../../enums/container/custom-nodes/CustomNode';
import { ObfuscationEvent } from '../../../enums/event-emitters/ObfuscationEvent';

import { AbstractCustomNodeGroup } from '../../AbstractCustomNodeGroup';
import { NodeAppender } from '../../../node/NodeAppender';

@injectable()
export class ConsoleOutputCustomNodeGroup extends AbstractCustomNodeGroup {
    /**
     * @type {ObfuscationEvent}
     */
    protected readonly appendEvent: ObfuscationEvent = ObfuscationEvent.BeforeObfuscation;

    /**
     * @type {Map<CustomNode, ICustomNode>}
     */
    @initializable()
    protected customNodes: Map <CustomNode, ICustomNode>;

    /**
     * @type {TCustomNodeFactory}
     */
    private readonly customNodeFactory: TCustomNodeFactory;

    /**
     * @type {IObfuscationEventEmitter}
     */
    private readonly obfuscationEventEmitter: IObfuscationEventEmitter;

    /**
     * @param {TCustomNodeFactory} customNodeFactory
     * @param {IObfuscationEventEmitter} obfuscationEventEmitter
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    constructor (
        @inject(ServiceIdentifiers.Factory__ICustomNode) customNodeFactory: TCustomNodeFactory,
        @inject(ServiceIdentifiers.IObfuscationEventEmitter) obfuscationEventEmitter: IObfuscationEventEmitter,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(randomGenerator, options);

        this.customNodeFactory = customNodeFactory;
        this.obfuscationEventEmitter = obfuscationEventEmitter;
    }

    /**
     * @param {TNodeWithBlockStatement} blockScopeNode
     * @param {IStackTraceData[]} stackTraceData
     */
    public appendCustomNodes (blockScopeNode: TNodeWithBlockStatement, stackTraceData: IStackTraceData[]): void {
        const randomStackTraceIndex: number = this.getRandomStackTraceIndex(stackTraceData.length);

        // consoleOutputDisableExpressionNode append
        this.appendCustomNodeIfExist(CustomNode.ConsoleOutputDisableExpressionNode, (customNode: ICustomNode) => {
            NodeAppender.appendNodeToOptimalBlockScope(
                stackTraceData,
                blockScopeNode,
                customNode.getNode(),
                randomStackTraceIndex
            );
        });

        // nodeCallsControllerFunctionNode append
        this.appendCustomNodeIfExist(CustomNode.NodeCallsControllerFunctionNode, (customNode: ICustomNode) => {
            let targetBlockScope: TNodeWithBlockStatement;

            if (stackTraceData.length) {
                targetBlockScope = NodeAppender.getOptimalBlockScope(stackTraceData, randomStackTraceIndex, 1);
            } else {
                targetBlockScope = blockScopeNode;
            }

            NodeAppender.prependNode(targetBlockScope, customNode.getNode());
        });
    }

    public initialize (): void {
        this.customNodes = new Map <CustomNode, ICustomNode>();

        if (!this.options.disableConsoleOutput) {
            return;
        }

        const callsControllerFunctionName: string = this.randomGenerator.getRandomVariableName(6);

        const consoleOutputDisableExpressionNode: ICustomNode = this.customNodeFactory(CustomNode.ConsoleOutputDisableExpressionNode);
        const nodeCallsControllerFunctionNode: ICustomNode = this.customNodeFactory(CustomNode.NodeCallsControllerFunctionNode);

        consoleOutputDisableExpressionNode.initialize(callsControllerFunctionName);
        nodeCallsControllerFunctionNode.initialize(this.appendEvent, callsControllerFunctionName);

        this.customNodes.set(CustomNode.ConsoleOutputDisableExpressionNode, consoleOutputDisableExpressionNode);
        this.customNodes.set(CustomNode.NodeCallsControllerFunctionNode, nodeCallsControllerFunctionNode);
    }
}
