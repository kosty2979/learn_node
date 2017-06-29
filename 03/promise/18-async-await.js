// Проблема отсутствующего catch и проглоченной ошибки

const fs = require('mz/fs');

async function example(path) {
  const res = await read(path);
}

async function read(path) {
  const stat = await fs.stat(path);

  if (stat.isDirectory()) {
    const files = await fs.readdir(path);
    return files;
  } else {
    const content = await fs.readFile(path);
    return content;
  }
}

example(__dirname).then(console.log).catch(console.error);
//
// async function a() {}
//
// console.log(typeof (a()).then); // undefined
