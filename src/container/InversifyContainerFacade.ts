import { Container, interfaces } from 'inversify';
import { ServiceIdentifiers } from './ServiceIdentifiers';

import { nodeControlFlowTransformersModule } from './modules/node-transformers/NodeControlFlowTransformersModule';
import { nodeObfuscatorsModule } from './modules/node-transformers/NodeObfuscatorsModule';
import { nodeTransformersModule } from './modules/node-transformers/NodeTransformersModule';
import { stackTraceAnalyzerModule } from './modules/stack-trace-analyzer/StackTraceAnalyzerModule';

import { ICustomNode } from '../interfaces/custom-nodes/ICustomNode';
import { IInputOptions } from '../interfaces/options/IInputOptions';
import { IInversifyContainerFacade } from '../interfaces/container/IInversifyContainerFacade';
import { IJavaScriptObfuscator } from '../interfaces/IJavaScriptObfsucator';
import { IObfuscationEventEmitter } from '../interfaces/event-emitters/IObfuscationEventEmitter';
import { IObfuscationResult } from '../interfaces/IObfuscationResult';
import { IObfuscator } from '../interfaces/IObfuscator';
import { IOptions } from '../interfaces/options/IOptions';
import { ISourceMapCorrector } from '../interfaces/ISourceMapCorrector';
import { IStorage } from '../interfaces/storages/IStorage';

import { CustomNodesStorage } from '../storages/custom-nodes/CustomNodesStorage';
import { JavaScriptObfuscatorInternal } from '../JavaScriptObfuscatorInternal';
import { ObfuscationEventEmitter } from '../event-emitters/ObfuscationEventEmitter';
import { ObfuscationResult } from '../ObfuscationResult';
import { Obfuscator } from '../Obfuscator';
import { Options } from "../options/Options";
import { SourceMapCorrector } from '../SourceMapCorrector';

export class InversifyContainerFacade implements IInversifyContainerFacade {
    /**
     * @type {interfaces.Container}
     */
    private readonly container: interfaces.Container;

    /**
     * @param options
     */
    constructor (options: IInputOptions) {
        this.container = new Container();

        this.container
            .bind<IOptions>(ServiceIdentifiers.IOptions)
            .toDynamicValue(() => {
                return new Options(options);
            })
            .inSingletonScope();

        this.container
            .bind<IJavaScriptObfuscator>(ServiceIdentifiers.IJavaScriptObfuscator)
            .to(JavaScriptObfuscatorInternal)
            .inSingletonScope();

        this.container
            .bind<IObfuscator>(ServiceIdentifiers.IObfuscator)
            .to(Obfuscator)
            .inSingletonScope();

        this.container
            .bind<IObfuscationResult>(ServiceIdentifiers['Factory<IObfuscationResult>'])
            .toFactory<IObfuscationResult>(() => {
                return (obfuscatedCode: string, sourceMap: string) => {
                    return new ObfuscationResult(obfuscatedCode, sourceMap);
                };
            });

        this.container
            .bind<ISourceMapCorrector>(ServiceIdentifiers.ISourceMapCorrector)
            .to(SourceMapCorrector)
            .inSingletonScope();

        this.container
            .bind<IObfuscationEventEmitter>(ServiceIdentifiers.IObfuscationEventEmitter)
            .to(ObfuscationEventEmitter)
            .inSingletonScope();

        this.container
            .bind<IStorage<ICustomNode>>(ServiceIdentifiers['IStorage<ICustomNode>'])
            .to(CustomNodesStorage)
            .inSingletonScope();

        // modules
        this.container.load(stackTraceAnalyzerModule);
        this.container.load(nodeTransformersModule);
        this.container.load(nodeControlFlowTransformersModule);
        this.container.load(nodeObfuscatorsModule);
    }

    /**
     * @param serviceIdentifier
     * @returns {T}
     */
    public get <T> (serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return this.container.get<T>(serviceIdentifier);
    }
}
