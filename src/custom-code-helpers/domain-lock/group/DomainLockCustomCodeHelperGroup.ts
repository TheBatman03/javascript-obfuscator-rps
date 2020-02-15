import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../../container/ServiceIdentifiers';

import { TCustomCodeHelperFactory } from '../../../types/container/custom-code-helpers/TCustomCodeHelperFactory';
import { TIdentifierNamesGeneratorFactory } from '../../../types/container/generators/TIdentifierNamesGeneratorFactory';
import { TInitialData } from '../../../types/TInitialData';
import { TNodeWithStatements } from '../../../types/node/TNodeWithStatements';

import { ICustomCodeHelper } from '../../../interfaces/custom-code-helpers/ICustomCodeHelper';
import { IOptions } from '../../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../../interfaces/utils/IRandomGenerator';
import { ICallsGraphData } from '../../../interfaces/analyzers/calls-graph-analyzer/ICallsGraphData';

import { initializable } from '../../../decorators/Initializable';

import { CustomCodeHelper } from '../../../enums/custom-code-helpers/CustomCodeHelper';
import { ObfuscationEvent } from '../../../enums/event-emitters/ObfuscationEvent';

import { AbstractCustomCodeHelperGroup } from '../../AbstractCustomCodeHelperGroup';
import { DomainLockCodeHelper } from '../DomainLockCodeHelper';
import { NodeAppender } from '../../../node/NodeAppender';
import { CallsControllerFunctionCodeHelper } from '../../calls-controller/CallsControllerFunctionCodeHelper';

@injectable()
export class DomainLockCustomCodeHelperGroup extends AbstractCustomCodeHelperGroup {
    /**
     * @type {ObfuscationEvent}
     */
    protected readonly appendEvent: ObfuscationEvent = ObfuscationEvent.BeforeObfuscation;

    /**
     * @type {Map<CustomCodeHelper, ICustomCodeHelper>}
     */
    @initializable()
    protected customCodeHelpers!: Map <CustomCodeHelper, ICustomCodeHelper>;

    /**
     * @type {TCustomCodeHelperFactory}
     */
    private readonly customCodeHelperFactory: TCustomCodeHelperFactory;

    /**
     * @param {TCustomCodeHelperFactory} customCodeHelperFactory
     * @param {TIdentifierNamesGeneratorFactory} identifierNamesGeneratorFactory
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    public constructor (
        @inject(ServiceIdentifiers.Factory__ICustomCodeHelper) customCodeHelperFactory: TCustomCodeHelperFactory,
        @inject(ServiceIdentifiers.Factory__IIdentifierNamesGenerator)
            identifierNamesGeneratorFactory: TIdentifierNamesGeneratorFactory,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(identifierNamesGeneratorFactory, randomGenerator, options);

        this.customCodeHelperFactory = customCodeHelperFactory;
    }

    /**
     * @param {TNodeWithStatements} nodeWithStatements
     * @param {ICallsGraphData[]} callsGraphData
     */
    public appendNodes (nodeWithStatements: TNodeWithStatements, callsGraphData: ICallsGraphData[]): void {
        const randomCallsGraphIndex: number = this.getRandomCallsGraphIndex(callsGraphData.length);

        // domainLock helper nodes append
        this.appendCustomNodeIfExist(CustomCodeHelper.DomainLock, (customCodeHelper: ICustomCodeHelper) => {
            NodeAppender.appendToOptimalBlockScope(
                callsGraphData,
                nodeWithStatements,
                customCodeHelper.getNode(),
                randomCallsGraphIndex
            );
        });

        // nodeCallsControllerFunction helper nodes append
        this.appendCustomNodeIfExist(CustomCodeHelper.CallsControllerFunction, (customCodeHelper: ICustomCodeHelper) => {
            const targetNodeWithStatements: TNodeWithStatements = callsGraphData.length
                ? NodeAppender.getOptimalBlockScope(callsGraphData, randomCallsGraphIndex, 1)
                : nodeWithStatements;

            NodeAppender.prepend(targetNodeWithStatements, customCodeHelper.getNode());
        });
    }

    public initialize (): void {
        this.customCodeHelpers = new Map <CustomCodeHelper, ICustomCodeHelper>();

        if (!this.options.domainLock.length) {
            return;
        }

        const callsControllerFunctionName: string = this.identifierNamesGenerator.generate();

        const domainLockCodeHelper: ICustomCodeHelper<TInitialData<DomainLockCodeHelper>> =
            this.customCodeHelperFactory(CustomCodeHelper.DomainLock);
        const nodeCallsControllerFunctionCodeHelper: ICustomCodeHelper<TInitialData<CallsControllerFunctionCodeHelper>> =
            this.customCodeHelperFactory(CustomCodeHelper.CallsControllerFunction);

        domainLockCodeHelper.initialize(callsControllerFunctionName);
        nodeCallsControllerFunctionCodeHelper.initialize(this.appendEvent, callsControllerFunctionName);

        this.customCodeHelpers.set(CustomCodeHelper.DomainLock, domainLockCodeHelper);
        this.customCodeHelpers.set(CustomCodeHelper.CallsControllerFunction, nodeCallsControllerFunctionCodeHelper);
    }
}
