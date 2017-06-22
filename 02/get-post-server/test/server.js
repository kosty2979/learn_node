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

    describe('GET request', () => {

        let fileContent;
        let file;
        before((done =>{
            fileContent = fs.readFileSync('public/index.html');
            file = fs.readFileSync('test/small.txt').toString();
            fs.writeFileSync('files/small.txt', file );
            done()

        }));

        it('GET index.html', (done) => {
            request('http://localhost:8888/', (error, response, body) => {
                if (error) return done(error);
                assert.equal(body, fileContent);
                done();
            });
        });


        it('GET file', (done) => {
            request('http://localhost:8888/small.txt', (error, res, body ) =>{
                if ( error )return done(error);
                assert(res.statusCode, 200)
                assert.equal(body, file);
                done();
            })
        });

        it('GET non-existent file', (done) => {
            const error={
                code: 404,
                text: 'Not found'
            };
            request('http://localhost:8888/nonexistent.txt', (err, res) =>{
                    assert.equal(res.statusCode, error.code);
                    assert.equal(res.body, error.text);
                    done()
            })

        })
    });

    describe('POST request', () => {
        let file;
        let bigFile;

        before((done) =>{
            file = fs.readFileSync('test/small.txt').toString();
            bigFile = fs.readFileSync('test/big.png').toString();
            fs.unlink('files/small.txt', (err) => {
                done()
            });
        });

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
                assert.equal(res.body, error.text);

                fs.unlink('files/small.txt', (err) => {
                    done(err)
                });
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
                fs.readFile('files/big.png', (err, content) => {
                    if (err) {
                        assert.equal(err.code, 'ENOENT');
                        done()
                    } else {
                        done(new Error("file saved and exist!!"))
                    }
                })
            })
        });


    })
});