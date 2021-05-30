import { TIdentifierNamesCache } from '../../types/TIdentifierNamesCache';
import { IInitializable } from '../IInitializable';

export interface IObfuscationResult extends IInitializable <[string, string]> {
    /**
     * @returns {TIdentifierNamesCache}
     */
    getIdentifierNamesCache (): TIdentifierNamesCache;

    /**
     * @return {string}
     */
    getObfuscatedCode (): string;

    /**
     * @return {string}
     */
    getSourceMap (): string;
}
