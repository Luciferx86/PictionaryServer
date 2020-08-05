# random-english-words
Generate random english words

## Installation
npm install random-english-words

## Usage
```js
var randomWords = require('random-english-words');

console.log(randomWords());                              // sugar
console.log(randomWords({minCount: 2}));                 // welcome date
console.log(randomWords({maxCount: 4}));                 // pump denounce sugar
console.log(randomWords({minCount: 2, maxCount: 4}));    // beat ignore sweet release
console.log(randomWords({minChars: 6}));                 // recognize 
console.log(randomWords({minCount: 2, minChars: 6}));    // administration however
console.log(randomWords({minCount: 2, minChars: 6, maxChars: 6}));  // create donate
console.log(randomWords({include: 'AI'}));               // air
console.log(randomWords({minCount: 4, include: 'ai'}));  // desert sabotage riot pain
console.log(randomWords({include: '$#!@$!@%'}));         // 
```
