'use strict';

module.exports = class Saferoom {    
    constructor(options = {}) {
        options = Object.assign({
            encodingCodepoints:
                    '_' + range('0', '9') + range('A', 'Z') + range('a', 'z')
        }, options);
        
        if (!options.escapeCodepoint) {
            options.escapeCodepoint = String.fromCharCode(
                    options.encodingCodepoints.codePointAt(0));
        }
        
        const digitCharacters =
                Array.from(options.encodingCodepoints).filter(
                        c => c.length === 1 && c !== options.escapeCodepoint)
                        .join('');
        
        let digitCharacterArray = [];
        for (let codePoint of digitCharacters) {
            digitCharacterArray.push(codePoint);
        }
        
        digitCharacterArray.sort((first, second) =>
                first.codePointAt(0) - second.codePointAt(0));
        
        const digitCharacterValues = {};
        digitCharacterArray.forEach((c, i) => digitCharacterValues[c] = i);
        
        let codeLength = 1;
        let num = 1114111;  // The largest unicode codepoint.
        while (num >= digitCharacterArray.length) {
            num = Math.floor(num / digitCharacterArray.length);
            codeLength++;
        }
        
        let validCharacterMap = new Object(null);
        for (let codePoint of options.encodingCodepoints) {
            validCharacterMap[codePoint] = true;
        }
        
        if (!(options.escapeCodepoint in validCharacterMap)) {
            throw new Error(
                    '`escapeCodepoint` must be an `encodingCharacter`.');
        }
        
        this.options = options;
        this.validCharacterMap = validCharacterMap;
        this.digitCharacterArray = digitCharacterArray;
        this.codeLength = codeLength;
        this.digitCharacterValues = digitCharacterValues
    }
    
    encode(input) {
        let result = '';
        
        for (let unicodeChar of input) {
            if (unicodeChar === this.options.escapeCodepoint ||
                    !this.validCharacterMap[unicodeChar]) {
                result += this.options.escapeCodepoint;
                result += toBaseX(unicodeChar.codePointAt(0),
                        this.digitCharacterArray, this.codeLength);
                result += this.options.escapeCodepoint;
            }
            else {
                result += unicodeChar;
            }
        }
        
        return result;
    }
    
    decode(input) {
        let result = '';
        
        let mode = 'top';
        let escapeSeq = '';
        for (let unicodeChar of input) {
            if (unicodeChar === this.options.escapeCodepoint) {
                if (mode === 'top') {
                    mode = 'escape';
                    escapeSeq = '';
                }
                else {
                    mode = 'top';
                    const codePoint =
                            fromBaseX(escapeSeq, this, this.codeLength);
                    result += String.fromCodePoint(codePoint);
                }
            }
            else {
                if (mode === 'top') {
                    result += unicodeChar;
                }
                else {
                    escapeSeq += unicodeChar;
                }
            }
        }
        
        return result;
    }
};

function toBaseX(num, alpha, codeLength) {
    let result = '';
    while (num >= alpha.length) {
        let remainder = num % alpha.length;
        result = alpha[remainder] + result;
        
        num = Math.floor(num / alpha.length);
    }
    
    if (num > 0) {
        result = alpha[num] + result;
    }
    
    while (result.length < codeLength) {
        result = alpha[0] + result;
    }
    
    return result;
}

function fromBaseX(representation, sr) {
    if (representation.length !== sr.codeLength) {
        throw new Error('Unexpected escape length.  Should have length ' +
                sr.codeLength + ', but got "' + representation +
                '" of length ' + representation.length + '.');
    }
    
    let num = 0;
    for (let unicodeChar of representation) {
        if (!(unicodeChar in sr.digitCharacterValues)) {
            throw new Error('Unexpected digit: ' + unicodeChar);
        }
        
        num += sr.digitCharacterValues[unicodeChar];
        num *= sr.digitCharacterArray.length;
    }
    
    num = Math.floor(num / sr.digitCharacterArray.length);
    
    return num;
}

function range(start, end) {
    const startCodePoint = start.codePointAt(0);
    const endCodePoint = end.codePointAt(0);
    
    if (endCodePoint < startCodePoint) {
        throw new Error(
                'Code point of `start` must be <= code point of `end`.');
    }
    
    let result = '';
    for (let i = startCodePoint; i <= endCodePoint; i++) {
        result += String.fromCodePoint(i);
    }
    
    return result;
}

module.exports.range = range;
