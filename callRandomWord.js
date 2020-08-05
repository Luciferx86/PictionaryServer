var randomWords = require('random-english-words');

randomWords({ minCount: 3 }).split(" ").forEach(element => {
    console.log(element);
});