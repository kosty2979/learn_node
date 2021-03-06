// несколько promise параллельно
// Вопрос - если ошибка, то как сделать, чтобы остальные результаты были получены,
// а вместо ошибочного - объект ошибки?

const http = require('http');

function loadUrl(url) {
  return new Promise( function(resolve, reject) {

    http.get(url,  function(res) {
      if (res.statusCode != 200) { // ignore 20x and 30x for now
        reject(new Error(`Bad response status ${res.statusCode}.`));
        return;
      }

      let body = '';
      res.setEncoding('utf8');
      res.on('data',  function(chunk) {
        body += chunk;
      });
      res.on('end',  function() {
        resolve(body);
      });

    }) // ENOTFOUND (no such host ) or ECONNRESET (server destroys connection)
      .on('error', reject);
  });
}

// если хоть один loadUrl вернёт ошибку,
// то другие все результаты отбрасываются, выполнение идёт в catch

// ВОПРОС: как сделать, чтобы не отбрасывались? Т.е. получать в results объект ошибки

// loadUrl('asdfkasdfkjsdf')
//   .then(
//     res => {},
//     err => {}
//   )

Promise.all([
  loadUrl('asdfkasdfkjsdf').catch(err => err),
  loadUrl('http://javascript.ru').catch(err => err),
  loadUrl('http://learn.javascript.ru').catch(err => err)
]).then( function(results) { // [error, result1, result2]

  console.log(results.map( function(html) { if (html.err) {...} return html.slice ? html.slice(0,80) : html; }));
}).catch(console.log);
