// import statements
let ITPpacket = require('./ITPResponse');
let fs = require("fs");

module.exports = {

    // function which handles incoming connections from the client
    handleClientJoining: function (sock) {
       
        // listens for request packets coming from the client on the socket connection
        sock.on('data', (data) => {

            // extracts the version from the packet
            let version = parseBitPacket(data, 0, 4);
            
            // extracts the request type from the packet (always 0 for this lab since client wants to 'Query')
            let requestType = parseBitPacket(data, 30, 2);
            
            // extracts the timestamp from the packet
            let timeStamp = parseBitPacket(data, 32, 32)
            
            // extracts the image type from the packet
            let imageType = parseBitPacket(data, 64, 4);

            // extracts the image name size from the packet
            let imageNameSize = parseBitPacket(data, 68, 28);

            // extracts the image name from the packet (payload directly after the 12 byte header) and converts to a string 
            let imageName = bytesToString(data.slice(12, 12 + imageNameSize));
            
            // initializes the file extension
            let fileExtension = '';

            // sets the file extension based on the image type 
            if(imageType == 1){
                fileExtension = 'png';
            }
            else if(imageType == 2){
                fileExtension = 'bmp';
            }
            else if(imageType == 3){
                fileExtension = 'tiff';
            }
            else if(imageType == 4){
                fileExtension = 'jpeg';
            }
            else if(imageType == 5){
                fileExtension = 'gif';
            }
            else if(imageType == 15){
                fileExtension = 'raw';
            }

            // creates variable to store the value of the response type
            let requestValue = '';

            // assigns the response value based on the response type 
            if(requestType == 0){
                requestValue = "Query";
            }
            else if(requestType == 1){
                requestValue = "Found";
            }
            else if(requestType == 2){
                requestValue = "Not Found";
            }
            else if(requestType == 3){
                requestValue = "Busy";
            }

            // Prints all the information about the request packet to the server console
            console.log(`\nClient-${timeStamp} is connected at timestamp: ${timeStamp}\n`);
            console.log(`ITP packet received: `)
            printPacketBit(data);
            console.log(`\nClient-${timeStamp} requests:`)
            console.log(`\t--ITP version: ${version}`)
            console.log(`\t--Timestamp: ${timeStamp}`)
            console.log(`\t--Request type: ${requestValue}`)
            console.log(`\t--Image file extension(s): ${fileExtension}`)
            console.log(`\t--Image file name: ${imageName}`)

            // creates variables needed to create the response packet
            let responseType, imageData, imageSize;

            // makes sure the version number is 9 and the request type is 0 before proceeding
            if (version === 9 && requestType === 0) {

                // reads the image file requested from the images folder
                fs.readFile(`./images/${imageName}.${fileExtension}`, (err, data) => {

                    // if the file was not found an error occurs
                    if (err) {
                        // sets response type to 2 for 'Not Found'
                        responseType = 2;
                        imageSize = 0;
                        imageData = Buffer.alloc(0);
                    } 
                    // if the file is found, stores the data and data size
                    else {
                        // sets response type to 1 for 'Found'
                        responseType = 1;
                        imageSize = data.length;
                        imageData = data;
                    }

                    // creates the response packet
                    ITPpacket.init(imageData, responseType, imageSize);
                    let packet = ITPpacket.getPacket();

                    // sends the response packet through the socket to the client
                    sock.write(packet);

                    // closes the socket connection with the client (keep in mind the server is still running to more requests can be recieved)
                    sock.end()
                    console.log(`\nClient-${timeStamp} closed the connection`)
                });
            }

            // either the version number or request type is incorrect, so the request is ignored and the connection is closed
            else {
                console.log("\nInvalid ITP request received.");
                sock.end();
                console.log(`Client-${timeStamp} closed the connection`)
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