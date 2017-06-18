/**
 ЗАДАЧА
 Написать HTTP-сервер для загрузки и получения файлов
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
   GET /file.ext [image.png, text.txt]
   - выдаёт файл file.ext из директории files,

   POST /file.ext []
   - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
   - если файл уже есть, то выдаёт ошибку 409
   - при превышении файлом размера 1MB выдаёт ошибку 413

   DELETE /file
   - удаляет файл
   - выводит 200 OK
   - если файла нет, то ошибка 404

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

- Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)
- index.html или curl для тестирования

 */

// Пример простого сервера в качестве основы

'use strict';

let http = require('http');
let url = require('url');
let fs = require('fs');
let path = require('path');


http.createServer((req, res)=>{
    let filePath = url.parse(req.url).pathname;

    checkRequest( filePath, res );

    switch (req.method) {
        case 'GET':
            sendFile( filePath, res );
            break;
        case 'POST':
            saveFile( req, res );
            break;
        case 'DELETE':
            deleteFile( filePath, res );
            break
        default:
            res.statusCode = 502;
            res.end('Not implemented');
    }

}).listen(3000);

function checkRequest(filePath, res){
    try{
        filePath = decodeURIComponent(filePath);
    } catch(e){
      res.statusCode = 400;
      res.end('Bad request');
      return
    }

    if(~filePath.indexOf('\0')){
      res.statusCode = 400;
      res.end('Bad request');
        return
    }

}

function sendFile(filePath, res){

    if (filePath === '/') {
        let path = __dirname + '/public/index.html';
        sendingFile( path, res );
    } else {
        let fileDir = path.normalize( __dirname+'/files' );
        filePath = path.normalize( path.join( fileDir, filePath) );

        if( filePath.indexOf(fileDir)!== 0){
            res.statusCode= 404;
            res.end('File not found');
            return
        }

        fs.stat(filePath, (err, stats)=>{
            if(err ||!stats.isFile()){
                res.statusCode= 404;
                res.end('File not found');
                return
            } else {
                sendingFile( filePath, res );
            }
        })


    }
}

function sendingFile( path, res ){
    let stream = new fs.ReadStream( path );
    stream.pipe(res);

    stream.on('error',(err)=>{
        res.statusCode=500;
        res.end('Server error');
        console.error(err)
    });

    res.on('close', ()=>{
        stream.destroy()
    })
}

function saveFile( req, res ){
    let filePath = url.parse(req.url).pathname;
    let fileDir = path.normalize( __dirname+'/files' );
    filePath = path.normalize( path.join( fileDir, filePath) );

    fs.stat(filePath, function(err, stats){
        if (stats){
            res.statusCode = 409;
            res.end('File exist');
            return;
        } else{
            savingFile(req, res, filePath )
        }
    })

}

function savingFile(req, res, filePath ){
    let file='';
    req
        .on('readable', ()=>{
            file += req.read();
        })
        .on('end', ()=>{
            try{
                if (file.length >1e6){
                    res.statusCode = 413;
                    res.end('File is too big');
                    return
                }
                let stream = new fs.WriteStream( filePath );
                stream.write(file);

                stream.on('error',(err)=>{
                    res.statusCode=500;
                    res.end('Server error');
                });

                stream.end( ()=>{
                    res.statusCode=200;
                    res.end('file saved');
                })
            } catch(e){
                res.statusCode = 400;
                res.end("Bad request");
                return;
            }
        })


}


function deleteFile( filePath, res ){
    let fileDir = path.normalize( __dirname+'/files' );
    filePath = path.normalize( path.join( fileDir, filePath) );
    fs.stat(filePath, (err, stats)=>{
        if(err ||!stats.isFile()){
            res.statusCode= 404;
            res.end('File not found(delete)');
            return
        } else {
            removeFile(filePath, res)
        }
    })
}
function removeFile(filePath, res){
    fs.unlink(filePath, (err)=>{
        if(err){
            res.statusCode = 500;
            res.end('Server Error');
            return
        }
        res.statusCode = 200;
        res.end('OK');
    })

}