// import statement
let singleton = require('../Server/Singleton');

// stores the header length which is always 12 bytes
const header_length = 12;

module.exports = {
    // initializes the module with the given image name, image type, version, request type, and the time stamp
    init: function (imageName, imageType, version) {
      this.version = version;
      // request type is 0 since client wants to 'Query'
      this.requestType = 0;
      // gets the timestamp from singleton
      this.timeStamp = singleton.getTimestamp();
      this.imageType = imageType;
      this.imageName = imageName;
    },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {

    // stores image name size
    let imageNameSize = this.imageName.length;

    // creates a packet with the length of the entire packet (header and payload)
    let packet = Buffer.alloc(header_length + imageNameSize);

    // stores the version which is 4 bits first in the packet
    storeBitPacket(packet, this.version, 0, 4);

    // the next 26 bits are reserved so we will skip them

    // stores the request type which is 2 bits next in the packet
    storeBitPacket(packet, this.requestType, 30, 2);

    // stores the timestamp which is 32 bits next in the packet 
    storeBitPacket(packet, this.timeStamp, 32, 32);

    // stores the image type which is 4 bits next in the packet 
    storeBitPacket(packet, this.imageType, 64, 4);

    // stores the image name size which is 28 bits next in the packet
    storeBitPacket(packet, imageNameSize, 68, 28);

    // converts the image name to bytes and stores in an array
    let imageNameBytes = stringToBytes(this.imageName);

    // adds each byte of the image name to the packet as the payload (after the 12 byte header)
    imageNameBytes.forEach((byte, i) => {
      packet[12 + i] = byte;
    });

    // returns the created packet 
    return packet;
  },
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

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
