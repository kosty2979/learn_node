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
        if( process.env.NODE_ENV !== 'test' ) throw new Error('set NODE_ENV=test !!!');
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
            const result = await  rp.get( { uri: HOST, resolveWithFullResponse: true } );
            assert.equal( result.body, fileContent );
            assert.equal(result.statusCode, 200);
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
            const result = await rp.get( { uri: HOST + '/small.txt', resolveWithFullResponse: true });
            assert.equal( result.body, file );
            assert.equal(result.statusCode,  200)
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
            const write = await rp.post( { uri:HOST + '/small.txt', form:  file,  resolveWithFullResponse: true } );
            const result = await fs.readFile( config.get('filesRoot') + '/small.txt' );
            assert.equal( file, result.toString());
            assert.equal( write.statusCode, 201);
            assert.equal( write.body, 'all done');
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

        it('POST write big file', async () => {
            try {
                await rp.post( HOST + '/big.png', { body: bigFile });
            } catch ( err ){
                assert.equal( err.statusCode, 413);
                assert.equal( err.error, 'File is too big!');
            };
            try {
                await fs.readFile( HOST + '/big.png' );
            } catch( err ){
                assert.equal(err.code, 'ENOENT');
            }
        })

    });

    describe('DELETE request', () => {

        before( async () => {
            await fs.copySync(`${fixtureDir}/small.txt`, config.get('filesRoot') + '/small.txt');
        });

        it('DELETE file', async () => {
            const result = await rp.delete({ uri:HOST + '/small.txt', resolveWithFullResponse: true });
            assert.equal(result.statusCode, 200);
            assert.equal(result.body, 'OK');
            try {
                await fs.readFile( config.get('filesRoot') + '/small.txt');
            } catch (err) {
                assert.equal( err.code,  'ENOENT')
            }
        });

        it('DELETE file', async () => {
            try {
                const result = await rp.delete({ uri : HOST + '/small.txt', resolveWithFullResponse: true  });
            } catch ( err ) {
                assert.equal(err.statusCode,  404);
                assert.equal(err.error, 'Not found');
            }
        });


    })
});