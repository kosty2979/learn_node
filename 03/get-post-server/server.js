const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const config = require('config');


module.exports = http.createServer((req, res) => {

    let pathname = decodeURI(url.parse(req.url).pathname);
    let filename = pathname.slice(1);

    if (filename.includes('/') || filename.includes('..')) {
        res.statusCode = 400;
        res.setHeader('Connection', 'close')
        res.end('Nested path!!');
        return;
    }

    if (req.method === 'GET') {
        if (pathname === '/') {
            sendFile(config.get('publicRoot') + '/index.html', res)
        } else {
            let filepath = path.join(config.get('filesRoot'), filename);
            sendFile(filepath, res);
        }
    }

    if (req.method === 'POST') {
        if (!filename) {
            res.statusCode = 404;
            res.end('File not found');
            return
        }
        let filepath = path.join(config.get('filesRoot'), filename);

        receiveFile(filepath, req, res);

    }

    if (req.method === 'DELETE') {
        let filepath = path.join(config.get('filesRoot'), filename);
        deleteFile(filepath, res);

    }


});

function receiveFile(filepath, req, res) {

    if (req.headers['content-length'] > config.get('limitFileSize')) {
        res.statusCode = 413;
        res.end('File is too big!');
        return;
    }

    let size = 0;
    let writeStream = new fs.WriteStream(filepath, {flags: 'wx'});

    req.pipe(writeStream);

    req.on('data', chunk => {
        size += chunk.length;
        if (size > config.get('limitFileSize')) {
            res.statusCode = 413;
            res.setHeader('Connection', 'close');
            res.end('File is too big');
            writeStream.destroy();
            fs.unlink(filepath, err => {
                console.log('remove file err')
            })
        }
    });

    req.on('close', () => {
        writeStream.destroy();
        fs.unlink(filepath, err => {
            console.log('remove file err')
        });
    });

    writeStream.on('error', err => {
        if (err.code === 'EEXIST') {
            res.statusCode = 409;
            res.end('File exist')
        } else {
            console.error(err);
            if (!res.headerSent) {
                res.writeHead(500, {'Connection': 'close'});
                res.write('Internal error')
            }
            res.end();

            fs.unlink(filepath, err => {
                console.log('remove file err')
            });
        }
    });

    writeStream.on('close', () => {
        res.statusCode = 201;
        res.end('all done');
    });

}

function sendFile(filepath, res) {
    let readStream = new fs.ReadStream(filepath);

    readStream.pipe(res);

    readStream.on('error', err => {
        if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('Not found');
        } else {
            console.error(err);
            if (!res.headerSent) {
                res.statusCode = 500;
                res.end('Internal error');
            } else {
                res.end();
            }
        }
    });

    readStream.on('open', () => {
        res.setHeader('Content-Type', mime.lookup(filepath));
    });

    res.on('close', () => {
        readStream.destroy();
    })

}

function deleteFile(filepath, res) {

    fs.unlink(filepath, (err) => {
        if (!err) {
            res.statusCode = 200;
            res.end('OK');
            return
        }
        if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('Not found');
        } else {
            res.statusCode = 500;
            res.end('Internal error');
        }

    })
}