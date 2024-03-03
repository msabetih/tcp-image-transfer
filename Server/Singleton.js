
// Some code need to be added here, that are common for the module

// initialize the time stamp variable 
let timeStamp = 0;
// initialize the sequence number variable
let sequenceNumber = 0

module.exports = {
    init: function() {
        // sets the time stamp to a random value between 1 - 999
        timeStamp = Math.floor(Math.random() * 999) + 1;

        // sets the sequence number to a random value within 26 bits 
        sequenceNumber = Math.floor(Math.random() * Math.pow(2, 26));

        // increases the timer by 1 every 10 milliseconds, and restarts the timer once it reaches 2^32
        setInterval(() => {
            timeStamp = (timeStamp + 1) % Math.pow(2, 32);
        }, 10);
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {

        // increases the sequence number by 1, and restarts once the number reaches 2^26
        sequenceNumber = (sequenceNumber + 1) % Math.pow(2,26);
        // returns the sequence number
        return sequenceNumber;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {

        // returns the time stamp
        return timeStamp;
    }

};