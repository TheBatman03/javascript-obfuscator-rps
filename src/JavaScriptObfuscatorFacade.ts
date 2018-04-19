import 'reflect-metadata';

import { ServiceIdentifiers } from './container/ServiceIdentifiers';

import { TInputOptions } from './types/options/TInputOptions';

import { IInversifyContainerFacade } from './interfaces/container/IInversifyContainerFacade';
import { IJavaScriptObfuscator } from './interfaces/IJavaScriptObfsucator';
import { IObfuscationResult } from './interfaces/IObfuscationResult';

import { InversifyContainerFacade } from './container/InversifyContainerFacade';

class JavaScriptObfuscatorFacade {
    /**
     * @type {string | undefined}
     */
    public static version: string = process.env.VERSION || 'unknown';

    /**
     * @param {string} sourceCode
     * @param {TInputOptions} inputOptions
     * @returns {IObfuscationResult}
     */
    public static obfuscate (sourceCode: string, inputOptions: TInputOptions = {}): IObfuscationResult {
        const inversifyContainerFacade: IInversifyContainerFacade = new InversifyContainerFacade();

        inversifyContainerFacade.load(sourceCode, inputOptions);

        const javaScriptObfuscator: IJavaScriptObfuscator = inversifyContainerFacade
            .get<IJavaScriptObfuscator>(ServiceIdentifiers.IJavaScriptObfuscator);
        const obfuscationResult: IObfuscationResult = javaScriptObfuscator.obfuscate(sourceCode);

        inversifyContainerFacade.unload();

        return obfuscationResult;
    }
}

export { JavaScriptObfuscatorFacade as JavaScriptObfuscator };
