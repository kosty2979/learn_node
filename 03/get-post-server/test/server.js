const server = require('../server');
const request = require('request');
const rp = require('request-promise');
const fs = require('fs-extra');
const assert = require('assert');
const config = require('config');

const PORT = 8888;
const HOST = `http://localhost:${PORT}`;
const fixtureDir = __dirname + '/fixtures';



describe('Server tests(async/await):', () => {

    let app;
    before( async () => {
        if( process.env.NODE_ENV !== 'test' )  throw new Error('set NODE_ENV=test !!!');
        app = await server.listen( PORT );
    });

    after( async () => {
        await app.close();
    });

    describe('GET request', () => {

        let fileContent;
        let file;
        before( async () => {
            fileContent =  await fs.readFile( config.get('publicRoot') + '/index.html');
            file = fs.readFileSync(`${ fixtureDir }/small.txt`).toString();
            await fs.writeFile( config.get('filesRoot') + '/small.txt', file);
        });

        it('GET index.html', async () => {
            const result = await  rp.get( HOST );
            assert.equal( result, fileContent );
            // assert.equal(res.statusCode, 200);
        });

        it('GET ../....//..', async () => {
            try {
                await  rp.get(HOST + '/../....//..');
            } catch( err ) {
                assert.equal( err.statusCode, 400 );
                assert.equal( err.error, 'Nested path!!' );
            }
        });

        it('GET file', async () => {
            const result = await rp.get( HOST + '/small.txt');
            assert.equal( result, file );
            // assert.equal(res.statusCode, 200)
        });

        it('GET non-existent file', async () => {
            try{
                await rp.get( HOST + '/nonexistent.txt');
            } catch ( err ){
                assert.equal( err.statusCode, 404 );
                assert.equal( err.error, 'Not found' );
            }
        });

    });

    describe('POST request', () => {
        let file;
        let bigFile;

        before( async () => {
            file = fs.readFileSync(`${fixtureDir}/small.txt`).toString();
            bigFile = fs.readFileSync(`${fixtureDir}/big.png`).toString();
            await fs.unlink(config.get('filesRoot') + '/small.txt')
        });

        it('POST write file ', async () => {
            await rp.post( HOST + '/small.txt', {body: file});
            const result = await fs.readFile( config.get('filesRoot') + '/small.txt' );
            assert.equal( file, result.toString());
            // assert.equal(res.statusCode, 201);
        });

        it('POST write exist file', async ()=> {
            let modtime = await fs.stat(config.get('filesRoot') + '/small.txt');
            let newModtime;
            try {
               await rp.post( HOST + "/small.txt", { body : file });
           } catch( err ){
                newModtime = await fs.stat(config.get('filesRoot') + '/small.txt');
                assert.equal( err.statusCode, 409 );
                assert.equal( err.error, 'File exist' );
                assert.equal( modtime.mtime.toString(), newModtime.mtime.toString() );
                await fs.unlink(config.get('filesRoot') + '/small.txt');
           }
        });
    //
    //     it('POST write exist file', (done) => {
    //         const error = {
    //             code: 409,
    //             text: 'File exist'
    //         };
    //         request.post( HOST + 'small.txt', {body: file}, (err, res) => {
    //             assert.equal(res.statusCode, error.code);
    //             assert.equal(res.body, error.text);
    //
    //             fs.unlink('files/small.txt', (err) => {
    //                 done(err)
    //             });
    //         })
    //     });
    //
    //     it("POST write big file", (done) => {
    //         const error = {
    //             code: 413,
    //             text: 'File is too big!'
    //         };
    //         request.post(HOST + 'big.png', {body: bigFile}, (err, res) => {
    //             assert.equal(res.statusCode, error.code);
    //             assert.equal(res.body, error.text);
    //             fs.readFile('files/big.png', (err, content) => {
    //                 if (err) {
    //                     assert.equal(err.code, 'ENOENT');
    //                     done()
    //                 } else {
    //                     done(new Error("file saved and exist!!"))
    //                 }
    //             })
    //         })
    //     });


    });

    // describe('DELETE request', () => {
    //
    //     let file;
    //     before((done => {
    //         file = fs.readFileSync('test/small.txt').toString();
    //         fs.writeFileSync('files/small.txt', file);
    //         done()
    //
    //     }));
    //
    //     it('DELETE file', (done) => {
    //         request.delete('http://localhost:8888/small.txt', (err, res) => {
    //             assert.equal(res.statusCode, 200);
    //             assert.equal(res.body, 'OK');
    //             fs.readFile('files/small.txt', (err, content) => {
    //                 if (err) {
    //                     assert.equal(err.code, 'ENOENT');
    //                     done()
    //                 } else {
    //                     done(new Error("file saved and exist!!"))
    //                 }
    //             })
    //         })
    //     });
    //
    //     it('DELETE non-existent file', (done) => {
    //         request.delete('http://localhost:8888/small.txt', (err, res) => {
    //             assert.equal(res.statusCode, 404);
    //             assert.equal(res.body, 'Not found');
    //             done()
    //         })
    //     })
    //
    // })
});