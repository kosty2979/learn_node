// ЗАДАЧА - сделать readFile, возвращающее promise
const fs = require('fs');
const util = require('util');

// fs.readFile(filePath, (err, content) => {});

const readFile = util.promisify(fs.readFile);

// function readFile(filePath) {
//   return util.promisify(fs.readFile)(filePath);
// }

readFile(__filename).then(console.log, console.error);
