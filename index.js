// SPECIFICATION: http://id3.org/id3v2.3.0
// ID3 messages consist of 3 elements: TAG HEADER, FRAME HEADER, and BODY

var TAG_HEADER_LENGTH = 10,
    FRAME_HEADER_LENGTH = 10,
    TAG_TYPE = 'ID3',
    ID3_MINOR_VERSION = 4,
    FRAME_TYPE = 'TXXX';

function injectStringAt(buf, val, start) {
    var strLen = val.length;
    for (var i = 0; i < strLen; i++) {
        buf[i + start] = val.charCodeAt(i);
    }
}

function writeID3(message) {
    var messageLength = message.length,
        bodyLength    = messageLength + FRAME_HEADER_LENGTH,
        tagLength     = messageLength + FRAME_HEADER_LENGTH + TAG_HEADER_LENGTH,
        buffer        = new ArrayBuffer(tagLength),
        bufferView    = new Uint8Array(buffer);

    // TAG HEADER: always 10 bytes
    // http://id3.org/id3v2.3.0#sec3.1
    // First 3 bytes is always "ID3".
    injectStringAt(bufferView, TAG_TYPE, 0);

    // Next 2 bytes re the minor/revision. This will be 4 and 0 for v2.4.0
    bufferView[3] = ID3_MINOR_VERSION;

    // Next byte is flags. We won't enable any.
    // Remaining 4 bytes are the length of the whole ID3 message. For now, just stuffing this hex value into the last byte of the 4.
    // The index of value of this byte will be 9 (10th byte due to 3 + 2 + 1 + 4 = 10, index is 0-based)
    bufferView[9] = bodyLength;


    // FRAME HEADER: always 10 bytes
    // http://id3.org/id3v2.3.0#sec3.3
    // First 4 bytes are the frame type ("TXXX" in this case)
    // We've already filled the first 10 bytes, so start at byte 11 (index 10)
    injectStringAt(bufferView, FRAME_TYPE, TAG_HEADER_LENGTH);

    // Next 4 bytes are the body size.
    // For now, just stuff into the last byte.
    // This will be at index 17 (due to 10 + 4 + 4 = 18th byte)
    bufferView[TAG_HEADER_LENGTH + 7] = messageLength;

    // This will leave 2 empty bytes at the end of the frame header (used for flags, but we won't fill).
    // Ignoring them; will be filled with empty bytes by ArrayBuffer

    // This point we have filled the first 20 bytes. Our actual data can be inserted now through the
    // end of the tag.
    injectStringAt(bufferView, message, TAG_HEADER_LENGTH + FRAME_HEADER_LENGTH);

    // base 64 encode the buffer
    return Buffer.from(buffer).toString('base64');
}

console.log(writeID3('Triggered at 6:28 PM'));
