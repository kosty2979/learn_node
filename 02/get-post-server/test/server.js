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

        request('http://localhost:8888', (error, response, body) => {
            if (error) return done(error);

            const fileContent = fs.readFileSync('public/index.html');

            assert.equal(body, fileContent);
            done();
        });

    });
});