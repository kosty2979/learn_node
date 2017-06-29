// const {
//   readdir,
//   stat,
// } = require('mz/fs');

const {
  readdir, stat
} = require('fs');
const { promisify } = require('util');

// function plusOne(n) { return n + 1; }
//
// [1,2,3].map(plusOne)

const promiseStat = promisify(stat);

console.time('file sizes')
promisify(readdir)(__dirname)
  .then(entries => {
    // console.log(promisify(stat)())
    return Promise.all(
      // promisify(stat) - function() {promise}
      // .map(promisify(stat)) -> promisify(stat)(el)
      entries.map((entry, index, entries) => promiseStat(entry))
    );
  })
  .then(entries => entries.filter(entry => entry.isFile()))
  .then(stats => {
    return stats.map(stat => stat.size);
  })
  .then(sizes => {
    return sizes.reduce((sum, size) => sum + size);
  })
  .then(res => {
    console.timeEnd('file sizes');
    return res;
  })
  .then(console.log)
  .catch(console.error);
