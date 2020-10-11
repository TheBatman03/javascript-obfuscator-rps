import { ContainerModule, interfaces } from 'inversify';
import { ServiceIdentifiers } from '../../ServiceIdentifiers';

import { INodeTransformer } from '../../../interfaces/node-transformers/INodeTransformer';

import { NodeTransformer } from '../../../enums/node-transformers/NodeTransformer';

import { EscapeSequenceTransformer } from '../../../node-transformers/finalizing-transformers/EscapeSequenceTransformer';

export const finalizingTransformersModule: interfaces.ContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    // finalizing transformers
    bind<INodeTransformer>(ServiceIdentifiers.INodeTransformer)
        .to(EscapeSequenceTransformer)
        .whenTargetNamed(NodeTransformer.EscapeSequenceTransformer);
});
