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
        it('POST send file fortest.txt', (done) => {
            const file = fs.readFileSync('test/fortest.txt').toString();
            const error = {
                code: 404,
                text: 'File not found'
            };

            request.post('http://localhost:8888/', {body: file},
                function (err, res) {
                    assert.equal(res.statusCode, error.code);
                    assert.equal(res.body, error.text)


                    done()
                    // fs.readFile('files/fortest.txt', (err, content)=>{
                    //     if (err){
                    //          if (err) return done(err);
                    //     }
                    //
                    //
                    // })
                })


        })


    })
});