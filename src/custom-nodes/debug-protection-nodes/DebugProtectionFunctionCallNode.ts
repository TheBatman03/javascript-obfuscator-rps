import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import { TIdentifierNamesGeneratorFactory } from '../../types/container/generators/TIdentifierNamesGeneratorFactory';
import { TStatement } from '../../types/node/TStatement';

import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';
import { ITemplateFormatter } from '../../interfaces/utils/ITemplateFormatter';

import { initializable } from '../../decorators/Initializable';

import { DebugProtectionFunctionCallTemplate } from '../../templates/debug-protection-nodes/debug-protection-function-call-node/DebugProtectionFunctionCallTemplate';

import { AbstractCustomNode } from '../AbstractCustomNode';
import { NodeUtils } from '../../node/NodeUtils';

@injectable()
export class DebugProtectionFunctionCallNode extends AbstractCustomNode {
    /**
     * @type {string}
     */
    @initializable()
    private callsControllerFunctionName!: string;

    /**
     * @type {string}
     */
    @initializable()
    private debugProtectionFunctionName!: string;

    /**
     * @param {TIdentifierNamesGeneratorFactory} identifierNamesGeneratorFactory
     * @param {ITemplateFormatter} templateFormatter
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    constructor (
        @inject(ServiceIdentifiers.Factory__IIdentifierNamesGenerator)
            identifierNamesGeneratorFactory: TIdentifierNamesGeneratorFactory,
        @inject(ServiceIdentifiers.ITemplateFormatter) templateFormatter: ITemplateFormatter,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(identifierNamesGeneratorFactory, templateFormatter, randomGenerator, options);
    }

    /**
     * @param {string} debugProtectionFunctionName
     * @param {string} callsControllerFunctionName
     */
    public initialize (debugProtectionFunctionName: string, callsControllerFunctionName: string): void {
        this.debugProtectionFunctionName = debugProtectionFunctionName;
        this.callsControllerFunctionName = callsControllerFunctionName;
    }

    /**
     * @returns {TStatement[]}
     */
    protected getNodeStructure (): TStatement[] {
        return NodeUtils.convertCodeToStructure(this.getTemplate());
    }

    /**
     * @returns {string}
     */
    protected getTemplate (): string {
        return this.templateFormatter.format(DebugProtectionFunctionCallTemplate(), {
            debugProtectionFunctionName: this.debugProtectionFunctionName,
            singleNodeCallControllerFunctionName: this.callsControllerFunctionName
        });
    }
}
