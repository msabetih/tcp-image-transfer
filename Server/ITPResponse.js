
// You may need to add some statements here
let singleton = require('./Singleton');

// stores the header length which is 12 bytes
const header_length = 12;

module.exports = {

    init: function () { // feel free to add function parameters as needed
        //
        // enter your code here
        //
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function (imageData, responseType, imageSize) {
        // enter your code here

        // creates a packet with the length of the entire packet (header and payload)
        let packet = Buffer.alloc(header_length + imageData.length)

        // stores the version number '9' which is 4 bits first in the packet
        storeBitPacket(packet, 9, 0, 4);

        // stores the response type which is 2 bits long, next in the packet 
        storeBitPacket(packet, responseType, 4, 2);

        // stores the sequence number which is 26 bits long, next in the packet
        storeBitPacket(packet, singleton.getSequenceNumber(), 6, 26);

        // stores the time stamp which is 32 bits long, next in the packet
        storeBitPacket(packet, singleton.getTimestamp(), 32, 32);

        // stores the image size which is 32 bits long, next in the packet
        storeBitPacket(packet, imageSize, 64, 32);

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