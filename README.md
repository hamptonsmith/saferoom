We are dead and the web is our hell.

Every service, language, and fever dream has its own restrictions on what
characters may appear in its keys, names, and identifiers.

Our sanitization options are a hodge-podge of things that happened to work
one time against Apache Server and were eventually enshrined as RFCs.

Sometimes all you want is an invertable process that keeps strings as readable
as possible while limiting them to whatever dynamic set of "safe" characters
your latest tormentor has saddled you with.

This library does that.

# TL;DR

```javascript
const Saferoom = require('@shieldsbetter/saferoom');

const sr = new Saferoom({
    validCharacters: '_&' + Saferoom.range('0', '9') +
            Saferoom.range('A', 'Z') + Saferoom.range('a', 'z'),
    escapeCharacter: '&'
});

const encoded = sr.encode('key_2006-15-09T06:43:02+9000');

console.log(/^[_&0-9A-Za-z]+$/.test(encoded));  // true
console.log(encoded);  // key_2006&000i&15&000i&09T06&000v&43&000v&02&000g&9000

console.log(sr.decode(encoded));  // key_2006-15-09T06:43:02+9000
```

Encoded strings meet the following properties:

* All characters will be from `encodingCharacters`.
* Lexicographic comparison of two escape sequences will yield the same order as
  lexicographic comparison of the original codepoints those escape sequences
  encode.

# Options

The constructor may be provided with a single options object.  If this object is
omitted, it defaults to `{}`.  The options object may contain the following
fields:

* `encodingCodepoints` - a string of codepoints that are valid in encoded
  strings.  For convenience we provide the `Saferoom.range(a, b)` function for
  generating strings containing all characters between two inclusive codepoints.
  Default: `'_' + Saferoom.range('0', '9') + Saferoom.range('A', 'Z') +
  Saferoom.range('a', 'z')`.
* `escapeCodepoint` - a single codepoint to be used to set off esape sequences.
  It is an error for this codepoint to be missing from `encodingCodepoints`.
  Default: `encodingCodepoints.codePointAt(0)`.
  
Note that the encoding format is dynamic based on these parameters and thus
the decoder and encoder must be configured the same.
