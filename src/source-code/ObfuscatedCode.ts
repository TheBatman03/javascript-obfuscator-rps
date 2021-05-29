import { inject, injectable } from 'inversify';
import { ServiceIdentifiers } from '../container/ServiceIdentifiers';

import { TIdentifierNamesCache } from '../types/caches/TIdentifierNamesCache';

import { ICryptUtils } from '../interfaces/utils/ICryptUtils';
import { IIdentifierNamesCacheStorage } from '../interfaces/storages/identifier-names-cache/IIdentifierNamesCacheStorage';
import { IObfuscatedCode } from '../interfaces/source-code/IObfuscatedCode';
import { IOptions } from '../interfaces/options/IOptions';

import { initializable } from '../decorators/Initializable';
import { SourceMapMode } from '../enums/source-map/SourceMapMode';

@injectable()
export class ObfuscatedCode implements IObfuscatedCode {
    /**
     * @type {string}
     */
    @initializable()
    private obfuscatedCode!: string;

    /**
     * @type {string}
     */
    @initializable()
    private sourceMap!: string;

    /**
     * @type {ICryptUtils}
     */
    private readonly cryptUtils: ICryptUtils;

    /**
     * @type {IIdentifierNamesCacheStorage}
     */
    private readonly identifierNamesCacheStorage: IIdentifierNamesCacheStorage;

    /**
     * @type {IOptions}
     */
    private readonly options: IOptions;

    /**
     * @param {ICryptUtils} cryptUtils
     * @param {IIdentifierNamesCacheStorage} identifierNamesCacheStorage
     * @param {IOptions} options
     */
    public constructor (
        @inject(ServiceIdentifiers.ICryptUtils) cryptUtils: ICryptUtils,
        @inject(ServiceIdentifiers.IIdentifierNamesCacheStorage)
            identifierNamesCacheStorage: IIdentifierNamesCacheStorage,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        this.cryptUtils = cryptUtils;
        this.identifierNamesCacheStorage = identifierNamesCacheStorage;
        this.options = options;
    }

    /**
     * @param {string} obfuscatedCode
     * @param {string} sourceMap
     */
    public initialize (obfuscatedCode: string, sourceMap: string): void {
        this.obfuscatedCode = obfuscatedCode;
        this.sourceMap = sourceMap;
    }

    /**
     * @returns {string}
     */
    public getIdentifierNamesCache (): TIdentifierNamesCache {
        return this.identifierNamesCacheStorage.getAsDictionary();
    }

    /**
     * @returns {string}
     */
    public getObfuscatedCode (): string {
        return this.correctObfuscatedCode();
    }

    /**
     * @returns {string}
     */
    public getSourceMap (): string {
        return this.sourceMap;
    }

    /**
     * @returns {string}
     */
    public toString (): string {
        return this.obfuscatedCode;
    }

    /**
     * @returns {string}
     */
    private correctObfuscatedCode (): string {
        if (!this.sourceMap) {
            return this.obfuscatedCode;
        }

        const sourceMapUrl: string = this.options.sourceMapBaseUrl + this.options.sourceMapFileName;

        let sourceMappingUrl: string = '//# sourceMappingURL=';

        switch (this.options.sourceMapMode) {
            case SourceMapMode.Inline:
                sourceMappingUrl += `data:application/json;base64,${this.cryptUtils.btoa(this.sourceMap)}`;

                break;

            case SourceMapMode.Separate:
            default:
                if (!sourceMapUrl) {
                    return this.obfuscatedCode;
                }

                sourceMappingUrl += sourceMapUrl;
        }

        return `${this.obfuscatedCode}\n${sourceMappingUrl}`;
    }
}
