// ВОПРОС - есть ли разница между .then(ok, fail) VS .then(ok).catch(fail) ?

// new Promise( function(resolve, reject) {
//   // ...
//
// }).then( function(result) {
//   // ...
// }).catch( function(err) {
//   // ...
//   if (err.code !== 'code') throw err;
//
//   return 'result';
// })
// .then()
// .then()
// .catch()

// vs

new Promise( function(resolve, reject) {
  // ...
  resolve('lala');
})
.then(() => {throw new Error('error');})
.then(
   function(result) { /*...*/  },
   function(err) { /* ... */console.log('caught', err) }
);
