import { ICustomNode } from '../../../interfaces/custom-nodes/ICustomNode';
import { IStackTraceData } from '../../../interfaces/stack-trace-analyzer/IStackTraceData';

import { ConsoleOutputDisableExpressionNode } from '../ConsoleOutputDisableExpressionNode';
import { NodeCallsControllerFunctionNode } from '../../node-calls-controller-nodes/NodeCallsControllerFunctionNode';

import { AbstractCustomNodesFactory } from '../../AbstractCustomNodesFactory';
import { NodeAppender } from '../../../node/NodeAppender';
import { Utils } from '../../../Utils';

export class ConsoleOutputCustomNodesFactory extends AbstractCustomNodesFactory {
    /**
     * @param stackTraceData
     * @returns {Map<string, ICustomNode>}
     */
    public initializeCustomNodes (stackTraceData: IStackTraceData[]): Map <string, ICustomNode> | undefined {
        if (!this.options.disableConsoleOutput) {
            return;
        }

        const callsControllerFunctionName: string = Utils.getRandomVariableName();
        const randomStackTraceIndex: number = NodeAppender.getRandomStackTraceIndex(stackTraceData.length);

        return this.syncCustomNodesWithNodesFactory(new Map <string, ICustomNode> ([
            [
                'consoleOutputDisableExpressionNode',
                new ConsoleOutputDisableExpressionNode(
                    stackTraceData,
                    callsControllerFunctionName,
                    randomStackTraceIndex,
                    this.options
                )
            ],
            [
                'ConsoleOutputNodeCallsControllerFunctionNode',
                new NodeCallsControllerFunctionNode(
                    stackTraceData,
                    callsControllerFunctionName,
                    randomStackTraceIndex,
                    this.options
                )
            ]
        ]));
    }
}
