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

    checkRequest(filePath, res);

    switch (req.method) {
        case 'GET':
            sendFile(filePath, res);
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
      res.end('Bad request')
        return
    }

}

function sendFile(filePath, res){

    let fileDir = __dirname +  '/files'

    if (filePath === '/') {
        // отдачу файлов следует переделать "правильно", через потоки, с нормальной обработкой ошибок
        fs.readFile(__dirname + '/public/index.html', (err, content) => {
            if (err) throw err;
            res.setHeader('Content-Type', 'text/html;charset=utf-8');
            res.end(content);
        });

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
                console.log("read error");
                res.statusCode= 404;
                res.end('File not found');
                return
            }
            res.statusCode= 200;
            res.end('ok');
        })


    }
}