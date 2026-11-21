# ImageDB TCP Client–Server

ImageDB is a small Node.js networking project that transfers images from a server to a client over a TCP connection. Its purpose is to demonstrate socket programming and the design of a custom binary protocol without relying on HTTP.

The client builds an Image Transfer Protocol (ITP) request containing an image name and type. The server decodes the request, searches its local image collection, and returns either the requested image or a `Not Found` response. The client then saves the received image and opens it in the system's default image viewer.

## Features

- TCP client–server communication using Node.js
- Custom binary request and response packets
- Bit-level encoding and decoding of packet headers
- Protocol version validation
- Sequence numbers and timestamps
- Support for PNG, BMP, TIFF, JPEG, GIF, and RAW image types

## Project structure

```text
Client/
  GetImage.js       Connects to the server and saves the response
  ITPRequest.js     Encodes an ITP request packet
Server/
  ImageDB.js        Starts the TCP server on 127.0.0.1:3000
  ClientsHandler.js Decodes requests and retrieves images
  ITPResponse.js    Encodes an ITP response packet
  Singleton.js      Manages timestamps and sequence numbers
  images/           Images available from the server
```

## Running the project

This project requires [Node.js](https://nodejs.org/).

Install the dependencies in both directories:

```bash
cd Server
npm install

cd ../Client
npm install
```

Start the server from the `Server` directory:

```bash
node ImageDB.js
```

In a second terminal, run the client from the `Client` directory. For example, to request `Dog.jpeg` using ITP version 9:

```bash
node GetImage.js -s 127.0.0.1:3000 -q Dog.jpeg -v 9
```

The downloaded image is saved in the `Client` directory and opened automatically. Other available filenames can be found in [`Server/images`](Server/images).

## Protocol overview

ITP uses a 12-byte header followed by an optional payload. A request identifies the protocol version, request type, timestamp, image format, and image name. A response identifies whether the image was found and includes a sequence number, timestamp, image size, and—when successful—the image bytes.

This project was developed as a university networking assignment to practise TCP sockets, binary data representation, and application-layer protocol design.
