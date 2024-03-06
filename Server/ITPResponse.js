
// import statement
let singleton = require('./Singleton');

// stores the header length which is always 12 bytes
const header_length = 12;

module.exports = {

    // initializes the module with given image data, response type, and image size
    init: function (imageData, responseType, imageSize) {
        this.imageData = imageData;
        this.responseType = responseType;
        this.imageSize = imageSize;
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function () {

        // creates a packet with the length of the entire packet (header and payload)
        let packet = Buffer.alloc(header_length + this.imageData.length)

        // stores the version number '9' which is 4 bits, stored first in the packet
        storeBitPacket(packet, 9, 0, 4);

        // stores the response type which is 2 bits, stored next in the packet 
        storeBitPacket(packet, this.responseType, 4, 2);

        // stores the sequence number which is 26 bits, stored next in the packet
        storeBitPacket(packet, singleton.getSequenceNumber(), 6, 26);

        // stores the time stamp which is 32 bits, stored next in the packet
        storeBitPacket(packet, singleton.getTimestamp(), 32, 32);

        // stores the image size which is 32 bits, stored next in the packet
        storeBitPacket(packet, this.imageSize, 64, 32);

        // adds the image data as the payload to the end of the packet (following the header)
        this.imageData.copy(packet, header_length);

        // returns the created packet
        return packet;
    }
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}