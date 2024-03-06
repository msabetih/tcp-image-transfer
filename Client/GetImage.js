let net = require("net");
let fs = require("fs");
let open = require("open");
let singleton = require('../Server/Singleton');

let ITPpacket = require("./ITPRequest"); // uncomment this line after you run npm install command

singleton.init();

// Enter your code for the client functionality here

// Extract the server IP, port and image file name from the command-line arguments
let serverIP = process.argv[3].split(':')[0];
let serverPort = process.argv[3].split(':')[1];
let imageName = process.argv[5];
let version = process.argv[7];

//console.log(imageName.split('.')[1]);

// Initialize the ITP request packet with the image name and version
ITPpacket.init('Rose', 5);
let queryPacket = ITPpacket.getBytePacket();

console.log(queryPacket)
printPacketBit(queryPacket)

// Create a TCP client
const client = new net.Socket();
client.connect(serverPort, serverIP, () => {
  console.log(`Connected to ImageDB server on: ${serverIP}:${serverPort}`);
  // Send the query packet
  client.write(queryPacket);
});


client.on('data', (data) => {
  // Handle the response from the server

  // Assuming the header is the first 32 bytes of the packet
  let header = data.slice(0, 12);
  console.log("ITP packet header received:");
  printPacketBit(header);
  printPacketBit(data.slice(0, 36));

  // Parse the response header to extract the image size
  let imageSize = parseBitPacket(data, 64, 32);
  let imageBuffer = Buffer.alloc(imageSize);

  // Copy the image data from the response packet's payload
  data.copy(imageBuffer, 0, 12); // Assuming the image data starts at byte 12

  // Save the image to a file
  fs.writeFileSync(imageName, imageBuffer);
  console.log(`Image saved as ${imageName}`);

  // Open the image using the default image viewer
  open(imageName).then(() => {
    console.log('Image opened in default viewer.');
  }).catch((err) => {
    console.error('Failed to open image:', err);
  });

  // Close the client socket
  client.end();
});

client.on('close', () => {
  console.log("Disconnected from the server");
  console.log("Connection closed");
});

client.on('error', (err) => {
  console.error("Connection error: " + err.message);
});



//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
      // let us get the actual byte position of the offset
      let bytePosition = Math.floor((offset + i) / 8);
      let bitPosition = 7 - ((offset + i) % 8);
      let bit = (packet[bytePosition] >> bitPosition) % 2;
      number = (number << 1) | bit;
    }
    return number;
  }
  
  // Prints the entire packet in bits format
  function printPacketBit(packet) {
    var bitString = "";
  
    for (var i = 0; i < packet.length; i++) {
      // To add leading zeros
      var b = "00000000" + packet[i].toString(2);
      // To print 4 bytes per line
      if (i > 0 && i % 4 == 0) bitString += "\n";
      bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
  }


  
