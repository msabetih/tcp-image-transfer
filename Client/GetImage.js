// import statements
let net = require("net");
let fs = require("fs");
let open = require("open");
let singleton = require('../Server/Singleton');
let ITPpacket = require("./ITPRequest"); 

// creates an instance of the singleton module 
singleton.init();

// extracts the ip address of the server from the command entered 
let serverIP = process.argv[3].split(':')[0];

// extracts the port of the server from the command entered 
let serverPort = process.argv[3].split(':')[1];

// extracts the name of the image being requested from the command entered
let imageName = process.argv[5];

// extracts the version from the command entered
let version = +process.argv[7];

// extracts the image name without the file extension
let justImageName = imageName.split('.')[0];

// extracts the file extension (in text)
let fileExtension = imageName.split('.')[1];

// creates variable to store the file extension as a number
let fileExtensionCode = 0;

// sets the file extension code based on the file extension text
if(fileExtension == 'png'){
  fileExtensionCode = 1;
}
else if(fileExtension == 'bmp'){
  fileExtensionCode = 2;
}
else if(fileExtension == 'tiff'){
  fileExtensionCode = 3;
}
else if(fileExtension == 'jpeg'){
  fileExtensionCode = 4;
}
else if(fileExtension == 'gif'){
  fileExtensionCode = 5;
}
else if(fileExtension == 'raw'){
  fileExtensionCode = 15;
}

// creates the request packet
ITPpacket.init(justImageName, fileExtensionCode, version);
let packet = ITPpacket.getBytePacket();

// creates a tcp connection to the server with the specified ip address and port number 
const client = new net.Socket();
client.connect(serverPort, serverIP, () => {

  // prints the connection to the client console
  console.log(`Connected to ImageDB server on: ${serverIP}:${serverPort}`);

  // sends the query request packet
  client.write(packet);

  // Error message displays if version number is not 9, and the connection closes
  if(version !== 9){
    client.end();
    console.log("\nInvalid ITP request sent. Make sure version number and request type are correct.")
    console.log("Disconnected from the server");
    console.log("Connection closed");
  }
  
});

// listens for response packets coming from the server on the socket connection
client.on('data', (data) => {

  // stores the header which is the first 12 bytes of the data packet 
  let header = data.slice(0, 12);

  // extracts the version from the packet
  let version = parseBitPacket(data, 0, 4);

  // extracts the response type from the packet
  let responseType = parseBitPacket(data, 4, 2);

  // extracts the sequence number from the packet
  let sequenceNumber = parseBitPacket(data, 6, 26);

  // extracts the time stamp from the packet
  let timeStamp = parseBitPacket(data, 32, 32);

  // extracts the image size from the packet
  let imageSize = parseBitPacket(data, 64, 32);

  // creates variable to store the response type value
  let responseValue = '';

  // assigns the response value based on the response type
  if(responseType == 0){
    responseValue = 'Query';
  }
  else if(responseType == 1){
    responseValue = 'Found';
  }
  else if(responseType == 2){
    responseValue = 'Not Found';
  }
  else if(responseType == 3){
    responseValue = 'Busy';
  }

    // prints information about the resonse packet recieved
    console.log("\nITP packet header received:");
    printPacketBit(header);
    console.log(`\nServer sent:`);
    console.log(`\t--ITP version = ${version}`);
    console.log(`\t--Response Type = ${responseValue}`);
    console.log(`\t--Sequence Number =${sequenceNumber}`);
    console.log(`\t--Timestamp = ${timeStamp}`);

  // creates a buffer with the image size, to be able to store the image data 
  let imageBuffer = Buffer.alloc(imageSize);

  // adds the image data to the buffer (image data starts after the header which is 12 bytes)
  data.copy(imageBuffer, 0, 12); 

  // saves the image to a file
  fs.writeFileSync(imageName, imageBuffer);

  // opens the image using the default image viewer
  open(imageName).then(() => {
  })
  // prints error if one occurs to the client console
  .catch((err) => {
    console.error('Failed to open image:', err);
  });

  // closes the connection and disconnects from the server, appropriate message is displayed on the clients console
  client.end();
  console.log("\nDisconnected from the server");
  console.log("Connection closed");
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

// Converts byte array to string
function bytesToString(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
      result += String.fromCharCode(array[i]);
  }
  return result;
}
  
