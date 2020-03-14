import { inject, injectable } from 'inversify';

import { ServiceIdentifiers } from '../container/ServiceIdentifiers';

import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { TNodeTransformerFactory } from '../types/container/node-transformers/TNodeTransformerFactory';
import { TNormalizedNodeTransformers } from '../types/node-transformers/TNormalizedNodeTransformers';
import { TVisitorDirection } from '../types/node-transformers/TVisitorDirection';
import { TVisitorFunction } from '../types/node-transformers/TVisitorFunction';
import { TVisitorResult } from '../types/node-transformers/TVisitorResult';

import { INodeTransformer } from '../interfaces/node-transformers/INodeTransformer';
import { INodeTransformerNamesGroupsBuilder } from '../interfaces/utils/INodeTransformerNamesGroupsBuilder';
import { INodeTransformersRunner } from '../interfaces/node-transformers/INodeTransformersRunner';
import { IVisitor } from '../interfaces/node-transformers/IVisitor';

import { NodeTransformer } from '../enums/node-transformers/NodeTransformer';
import { NodeTransformationStage } from '../enums/node-transformers/NodeTransformationStage';
import { VisitorDirection } from '../enums/node-transformers/VisitorDirection';

import { NodeGuards } from '../node/NodeGuards';
import { NodeMetadata } from '../node/NodeMetadata';

@injectable()
export class NodeTransformersRunner implements INodeTransformersRunner {
    /**
     * @type {TNodeTransformerFactory}
     */
    private readonly nodeTransformerFactory: TNodeTransformerFactory;

    /**
     * @type {INodeTransformerNamesGroupsBuilder}
     */
    private readonly nodeTransformerNamesGroupsBuilder: INodeTransformerNamesGroupsBuilder;

    /**
     * @param {TNodeTransformerFactory} nodeTransformerFactory
     * @param {INodeTransformerNamesGroupsBuilder} nodeTransformerNamesGroupsBuilder
     */
    public constructor (
        @inject(ServiceIdentifiers.Factory__INodeTransformer)
            nodeTransformerFactory: TNodeTransformerFactory,
        @inject(ServiceIdentifiers.INodeTransformerNamesGroupsBuilder)
            nodeTransformerNamesGroupsBuilder: INodeTransformerNamesGroupsBuilder,
    ) {
        this.nodeTransformerFactory = nodeTransformerFactory;
        this.nodeTransformerNamesGroupsBuilder = nodeTransformerNamesGroupsBuilder;
    }

    /**
     * @param {T} astTree
     * @param {NodeTransformer[]} nodeTransformerNames
     * @param {NodeTransformationStage} nodeTransformationStage
     * @returns {T}
     */
    public transform <T extends ESTree.Node = ESTree.Program> (
        astTree: T,
        nodeTransformerNames: NodeTransformer[],
        nodeTransformationStage: NodeTransformationStage
    ): T {
        if (!nodeTransformerNames.length) {
            return astTree;
        }

        const normalizedNodeTransformers: TNormalizedNodeTransformers =
            this.buildNormalizedNodeTransformers(nodeTransformerNames, nodeTransformationStage);
        const nodeTransformerNamesGroups: NodeTransformer[][] =
            this.nodeTransformerNamesGroupsBuilder.build(normalizedNodeTransformers);

        for (const nodeTransformerNamesGroup of nodeTransformerNamesGroups) {
            const enterVisitors: IVisitor[] = [];
            const leaveVisitors: IVisitor[] = [];

            for (const nodeTransformerName of nodeTransformerNamesGroup) {
                const nodeTransformer: INodeTransformer = normalizedNodeTransformers[nodeTransformerName];
                const visitor: IVisitor | null = nodeTransformer.getVisitor(nodeTransformationStage);

                if (!visitor) {
                    continue;
                }

                if (visitor.enter) {
                    enterVisitors.push({ enter: visitor.enter });
                }

                if (visitor.leave) {
                    leaveVisitors.push({ leave: visitor.leave });
                }
            }

            if (!enterVisitors.length && !leaveVisitors.length) {
                continue;
            }

            estraverse.replace(astTree, {
                enter: this.mergeVisitorsForDirection(enterVisitors, VisitorDirection.Enter),
                leave: this.mergeVisitorsForDirection(leaveVisitors, VisitorDirection.Leave)
            });
        }

        return astTree;
    }

    /**
     * @param {NodeTransformer[]} nodeTransformerNames
     * @param {NodeTransformationStage} nodeTransformationStage
     * @returns {TNormalizedNodeTransformers}
     */
    private buildNormalizedNodeTransformers (
        nodeTransformerNames: NodeTransformer[],
        nodeTransformationStage: NodeTransformationStage
    ): TNormalizedNodeTransformers {
        return nodeTransformerNames
            .reduce<TNormalizedNodeTransformers>(
                (acc: TNormalizedNodeTransformers, nodeTransformerName: NodeTransformer) => {
                    const nodeTransformer: INodeTransformer = this.nodeTransformerFactory(nodeTransformerName);

                    if (!nodeTransformer.getVisitor(nodeTransformationStage)) {
                        return acc;
                    }

                    return {
                        ...acc,
                        [nodeTransformerName]: nodeTransformer
                    };
                },
                {}
            );
    }

    /**
     * @param {IVisitor[]} visitors
     * @param {TVisitorDirection} direction
     * @returns {TVisitorFunction}
     */
    private mergeVisitorsForDirection (visitors: IVisitor[], direction: TVisitorDirection): TVisitorFunction {
        const visitorsLength: number = visitors.length;

        if (!visitorsLength) {
            return (node: ESTree.Node, parentNode: ESTree.Node | null): ESTree.Node => node;
        }

        return (node: ESTree.Node, parentNode: ESTree.Node | null): ESTree.Node | estraverse.VisitorOption => {
            if (NodeMetadata.isIgnoredNode(node)) {
                return estraverse.VisitorOption.Skip;
            }

            for (let i: number = 0; i < visitorsLength; i++) {
                const visitorFunction: TVisitorFunction | undefined = visitors[i][direction];

                if (!visitorFunction) {
                    continue;
                }

                const visitorResult: TVisitorResult = visitorFunction(node, parentNode);

                if (!visitorResult || !NodeGuards.isNode(visitorResult)) {
                    continue;
                }

                node = visitorResult;
            }

            return node;
        };
    }
}
