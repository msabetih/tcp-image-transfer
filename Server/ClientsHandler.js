let ITPpacket = require('./ITPResponse');
let fs = require("fs");

// You may need to add some statements here


module.exports = {

    handleClientJoining: function (sock) {
        //
        // Enter your code here
        //
        // you may need to develop some helper functions
        // that are defined outside this export block
        sock.on('data', (data) => {
            // Assume the ITP request packet structure follows the provided specification
            let version = parseBitPacket(data, 0, 4);
            let requestType = parseBitPacket(data, 4, 2);
            let imageNameSize = parseBitPacket(data, 60, 28);
            let imageName = bytesToString(data.slice(12, 12 + imageNameSize));
            let responseType, imageData, imageSize;

            console.log(`Client-932 is connected at timestamp: 931\n`);
            console.log(`ITP packet received: `)
            printPacketBit(data);

            console.log(`\nClient-931 requests:`)
            console.log(`\t--ITP version: ${version}`)
            console.log(`\t--Timestamp:`)
            console.log(`\t--Request type: ${requestType}`)
            console.log(`\t--Image file extension(s) ${imageName}`)
            console.log(`\t--Image file name: ${imageName}`)


            // Check version and requestType
            if (version === 9 && requestType === 0) { // 0 for 'Query'
                fs.readFile(`./images/${imageName}.gif`, (err, data) => {
                    if (err) {
                        console.log(err);
                        // If the image doesn't exist, send 'Not found' response
                        responseType = 1; // Assuming 'Not found' is indicated by '1'
                        imageSize = 0;
                        imageData = Buffer.alloc(0);
                    } else {
                        // If the image exists, send it with the 'Found' response
                        responseType = 0; // Assuming 'Found' is indicated by '0'
                        imageSize = data.length;
                        imageData = data;
                    }

                    let packet = ITPpacket.getPacket(imageData, responseType, imageSize);
                    sock.write(packet);

                    // If there's no image data, don't need to send payload
                    if (imageSize > 0) {
                        sock.write(imageData);
                        sock.end()
                        console.log(`\nClient-931 closed the connection`)
                    }
                });
            } else {
                // Handle invalid ITP version or request type
                console.log("Invalid ITP request received.");
                sock.end();
            }
        });
    }
};


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