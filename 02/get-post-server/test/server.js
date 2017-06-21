const server = require('../server');
const request = require('request');
const fs = require('fs');
const assert = require('assert');

describe('Server tests:', () => {
    let app;
    before((done) => {
        app = server.listen(8888, done);
    });

    after((done) => {
        app.close(done);
    });

    describe('GET request', () =>
        it('get index.html', (done) => {
            request('http://localhost:8888/', (error, response, body) => {
                if (error) return done(error);

                const fileContent = fs.readFileSync('public/index.html');

                assert.equal(body, fileContent);
                done();
            });
        })
    );

    describe('POST request', () => {

        fs.unlink('files/small.txt', (err) => {
        });
        const file = fs.readFileSync('test/small.txt').toString();
        const bigFile = fs.readFileSync('test/big.png').toString();

        it('POST write file ', (done) => {
            request.post('http://localhost:8888/small.txt', {body: file}, (err, res) => {
                assert.equal(res.statusCode, 201);
                fs.readFile('files/small.txt', (err, content) => {
                    if (err) {
                        if (err) return done(err);
                    }
                    assert.equal(file, content.toString())

                });
                done()
            })
        });

        it('POST write exist file', (done) => {
            const error = {
                code: 409,
                text: 'File exist'
            };
            request.post('http://localhost:8888/small.txt', {body: file}, (err, res) => {
                assert.equal(res.statusCode, error.code);
                assert.equal(res.body, error.text)

                done()
            })
        });

        it("POST write big file", (done) => {
            const error = {
                code: 413,
                text: 'File is too big!'
            };
            request.post('http://localhost:8888/big.png', {body: bigFile}, (req, res) => {
                assert.equal(res.statusCode, error.code);
                assert.equal(res.body, error.text);

                done()
            })
        })


    })
});