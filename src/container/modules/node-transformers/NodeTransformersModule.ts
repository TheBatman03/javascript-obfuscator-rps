import { ContainerModule, interfaces } from 'inversify';
import { ServiceIdentifiers } from '../../ServiceIdentifiers';

import { INodeTransformer } from '../../../interfaces/node-transformers/INodeTransformer';

import { NodeTransformers } from '../../../enums/container/NodeTransformers';

import { FunctionControlFlowTransformer } from '../../../node-transformers/control-flow-transformers/FunctionControlFlowTransformer';

import { BlockStatementControlFlowTransformer } from '../../../node-transformers/control-flow-transformers/BlockStatementControlFlowTransformer';
import { CatchClauseTransformer } from '../../../node-transformers/obfuscation-transformers/CatchClauseTransformer';
import { FunctionDeclarationTransformer } from '../../../node-transformers/obfuscation-transformers/FunctionDeclarationTransformer';
import { FunctionTransformer } from '../../../node-transformers/obfuscation-transformers/FunctionTransformer';
import { LabeledStatementTransformer } from '../../../node-transformers/obfuscation-transformers/LabeledStatementTransformer';
import { LiteralTransformer } from '../../../node-transformers/obfuscation-transformers/LiteralTransformer';
import { MemberExpressionTransformer } from '../../../node-transformers/obfuscation-transformers/MemberExpressionTransformer';
import { MethodDefinitionTransformer } from '../../../node-transformers/obfuscation-transformers/MethodDefinitionTransformer';
import { ObjectExpressionTransformer } from '../../../node-transformers/obfuscation-transformers/ObjectExpressionTransformer';
import { TemplateLiteralTransformer } from '../../../node-transformers/obfuscation-transformers/TemplateLiteralTransformer';
import { VariableDeclarationTransformer } from '../../../node-transformers/obfuscation-transformers/VariableDeclarationTransformer';

export const nodeTransformersModule: interfaces.ContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    // node control flow transformers
    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(BlockStatementControlFlowTransformer)
        .whenTargetNamed(NodeTransformers.BlockStatementControlFlowTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(FunctionControlFlowTransformer)
        .whenTargetNamed(NodeTransformers.FunctionControlFlowTransformer);

    // node obfuscators
    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(CatchClauseTransformer)
        .whenTargetNamed(NodeTransformers.CatchClauseTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(FunctionDeclarationTransformer)
        .whenTargetNamed(NodeTransformers.FunctionDeclarationTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(FunctionTransformer)
        .whenTargetNamed(NodeTransformers.FunctionTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(LabeledStatementTransformer)
        .whenTargetNamed(NodeTransformers.LabeledStatementTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(LiteralTransformer)
        .whenTargetNamed(NodeTransformers.LiteralTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(MemberExpressionTransformer)
        .whenTargetNamed(NodeTransformers.MemberExpressionTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(MethodDefinitionTransformer)
        .whenTargetNamed(NodeTransformers.MethodDefinitionTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(ObjectExpressionTransformer)
        .whenTargetNamed(NodeTransformers.ObjectExpressionTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(TemplateLiteralTransformer)
        .whenTargetNamed(NodeTransformers.TemplateLiteralTransformer);

    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(VariableDeclarationTransformer)
        .whenTargetNamed(NodeTransformers.VariableDeclarationTransformer);

    // node transformers factory
    bind<INodeTransformer[]>(ServiceIdentifiers.Factory__INodeTransformer)
        .toFactory<INodeTransformer[]>((context: interfaces.Context) => {
            const cache: Map <NodeTransformers, INodeTransformer> = new Map();

            return (nodeTransformersMap: Map<string, NodeTransformers[]>) => (nodeType: string) => {
                const nodeTransformers: NodeTransformers[] = nodeTransformersMap.get(nodeType) || [];
                const instancesArray: INodeTransformer[] = [];

                nodeTransformers.forEach((transformer: NodeTransformers) => {
                    let nodeTransformer: INodeTransformer;

                    if (cache.has(transformer)) {
                        nodeTransformer = <INodeTransformer>cache.get(transformer);
                    } else {
                        nodeTransformer = context.container.getNamed<INodeTransformer>(
                            ServiceIdentifiers.INodeTransformer,
                            transformer
                        );
                        cache.set(transformer, nodeTransformer);
                    }

                    instancesArray.push(nodeTransformer);
                });

                return instancesArray;
            };
        });
});
