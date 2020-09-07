import { TInputOptions } from '../../types/options/TInputOptions';

import { OptionsPreset } from '../../enums/options/presets/OptionsPreset';
import { StringArrayEncoding } from '../../enums/StringArrayEncoding';

import { LOW_OBFUSCATION_PRESET } from './LowObfuscation';

export const MEDIUM_OBFUSCATION_PRESET: TInputOptions = Object.freeze({
    ...LOW_OBFUSCATION_PRESET,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    numbersToExpressions: true,
    optionsPreset: OptionsPreset.MediumObfuscation,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArrayEncoding: [
        StringArrayEncoding.Base64
    ],
    stringArrayIntermediateCalls: 5,
    transformObjectKeys: true
});
