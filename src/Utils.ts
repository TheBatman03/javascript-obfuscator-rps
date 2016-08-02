import { Chance } from 'chance';

import { JSFuck } from './enums/JSFuck';

export class Utils {
    /**
     * @type {Chance.Chance}
     */
    private static randomGenerator: Chance.Chance = new Chance();

    /**
     * @param array
     * @param searchElement
     * @returns {boolean}
     */
    public static arrayContains (array: any[], searchElement: any): boolean {
        return array.indexOf(searchElement) >= 0;
    }

    /**
     * @param array
     * @param times
     * @returns {T[]}
     */
    public static arrayRotate <T> (array: T[], times: number): T[] {
        if (!array.length) {
            throw new ReferenceError(`Cannot rotate empty array.`);
        }

        if (times <= 0) {
            return array;
        }

        let newArray: T[] = array,
            temp: T | undefined;

        while (times--) {
            temp = newArray.pop()!;
            newArray.unshift(temp);
        }

        return newArray;
    }

    /**
     * @param string
     * @param encode
     */
    public static btoa (string: string, encode: boolean = true): string {
        return new Buffer(
            encode ? encodeURI(string) : string
        ).toString('base64');
    }

    /**
     * @param dec
     * @returns {string}
     */
    public static decToHex (dec: number): string {
        const radix: number = 16;

        return Number(dec).toString(radix);
    }

    /**
     * @returns {Chance.Chance}
     */
    public static getRandomGenerator (): Chance.Chance {
        return Utils.randomGenerator;
    }

    /**
     * @param length
     * @returns any
     */
    public static getRandomVariableName (length: number = 6): string {
        const rangeMinInteger: number = 10000,
            rangeMaxInteger: number = 99999999,
            prefix: string = '_0x';

        return `${prefix}${(
            Utils.decToHex(
                Utils.getRandomGenerator().integer({
                    min: rangeMinInteger,
                    max: rangeMaxInteger
                })
            )
        ).substr(0, length)}`;
    }

    /**
     * @param number
     * @returns {boolean}
     */
    public static isInteger (number: number): boolean {
        return number % 1 === 0;
    }

    /**
     * @param obj
     * @returns {T}
     */
    public static strEnumify <T extends {[prop: string]: ''|string}> (obj: T): T {
        return obj;
    }

    /**
     * @param string
     * @returns {string}
     */
    public static stringToJSFuck (string: string): string {
        return Array
            .from(string)
            .map((character: string): string => {
                return JSFuck[character] || character;
            })
            .join(' + ');
    }

    /**
     * @param string
     * @returns {string}
     */
    public static stringToUnicode (string: string): string {
        const radix: number = 16;

        let prefix: string,
            regexp: RegExp = new RegExp('[\x00-\x7F]'),
            template: string;

        return `'${string.replace(/[\s\S]/g, (escape: string): string => {
            if (regexp.test(escape)) {
                prefix = '\\x';
                template = '0'.repeat(2);
            } else {
                prefix = '\\u';
                template = '0'.repeat(4);  
            }
            
            return `${prefix}${(template + escape.charCodeAt(0).toString(radix)).slice(-template.length)}`;
        })}'`;
    }
}
