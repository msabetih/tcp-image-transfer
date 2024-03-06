// You may need to add some statements here
let singleton = require('../Server/Singleton');

module.exports = {
  init: function (imageName, imageType) {
    // feel free to add function parameters as needed
    //
    // enter your code here
    //
    this.imageName = imageName;
    this.imageType = imageType; // You should have a function or a map to convert file extension to IT value.
    this.version = 9;
    this.timeStamp = singleton.getTimestamp(); // Assume this function exists and returns a 32-bit value.
    console.log(singleton.getTimestamp())
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {
    // enter your code here
    let imageNameSize = this.imageName.length;
    let packetSize = 12 + imageNameSize; // Header is 12 bytes, rest is the image name size.
    let packet = Buffer.alloc(packetSize);

    // Store version (4 bits) and request type (2 bits) in the first byte
    storeBitPacket(packet, this.version, 0, 4);
    storeBitPacket(packet, 0, 4, 2); // Request type is 0 for 'Query'
    // The next 26 bits are reserved and already set to 0 by Buffer.alloc

    // Store timestamp (32 bits)
    storeBitPacket(packet, this.timeStamp, 32, 32);

    // Store image type (4 bits)
    storeBitPacket(packet, this.imageType, 64, 4);

    // Store image file name size (28 bits)
    storeBitPacket(packet, imageNameSize, 68, 28);

    // Append the image file name at the end of the packet
    let imageNameBytes = stringToBytes(this.imageName);
    imageNameBytes.forEach((byte, i) => {
      packet[12 + i] = byte;
    });

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
