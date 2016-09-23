import { IObfuscatorOptions } from "../interfaces/IObfuscatorOptions";

import { SourceMapMode } from "../enums/SourceMapMode";

export const NO_CUSTOM_NODES_PRESET: IObfuscatorOptions = Object.freeze({
    compact: true,
    debugProtection: false,
    debugProtectionInterval: false,
    disableConsoleOutput: false,
    domainLock: [],
    encodeUnicodeLiterals: false,
    optimize: false,
    reservedNames: [],
    rotateUnicodeArray: false,
    selfDefending: false,
    sourceMap: false,
    sourceMapBaseUrl: '',
    sourceMapFileName: '',
    sourceMapMode: SourceMapMode.Separate,
    unicodeArray: false,
    unicodeArrayThreshold: 0,
    wrapUnicodeArrayCalls: false
});
