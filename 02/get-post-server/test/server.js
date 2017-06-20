const server = require('../server');
const request = require('request');
const fs = require('fs');
const assert = require('assert');

describe('server tests', () => {
    let app;
    before((done) => {
        app = server.listen(8888, done);
    });

    after((done) => {
        app.close(done);
    });

    it('get index.html', (done) => {
        /*
         1. запустить сервер
         2. сделать GET запрос на /
         3. дождаться ответа
         4. прочитать с диска public/index.html
         5. сравнить, что ответ сервера и файла с диска одинаковые
         6. остановить сервер
         */
        request('http://localhost:8888', (error, response, body) => {
            if (error) return done(error);

            const fileContent = fs.readFileSync('public/index.html');

            assert.equal(body, fileContent);
            done();
        });

    });
});