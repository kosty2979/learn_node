
if (process.env.TRACE) {
  require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();
const config = require('config');

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));

const clients = [];

const Router = require('koa-router');
const router = new Router();




router.get('/subscribe', async (ctx) => {
    await subscribe(ctx);
});

router.post('/publish', async (ctx) => {
    await publish(ctx);
});

app.use(router.routes());

app.listen(config.get('port'), console.log( 'server start on localhost:3000' ));


function subscribe(ctx) {
    return new Promise((resolve, reject) => {

        const  sendMessage = (content) =>{
           ctx.response.body = content;
           // ctx.res.setHeader('Cache-Control', "no-cache, no-store, private");
           return resolve();
        };

        ctx.req.on('close', () => {
           // if( ctx.response.statusCode === 200 ) return;
            clients.splice(clients.indexOf(sendMessage), 1);
            return resolve( console.error('session closed') );
        });
        clients.push( sendMessage )
    });
};

function publish (ctx) {
    return new Promise( (resolve, reject) => {
        let body = ctx.request.body;

        if( !body.message.trim() ){
            ctx.res.statusCode = 413;
            ctx.res.end("no message");
            return  resolve();
        };

        if ( body.message.length > 100 ) {
            ctx.res.statusCode = 413;
            ctx.res.end("Your message is too big for my little chat");
            return  resolve();
        };


        clients.forEach(( sendMessage ) => {
            sendMessage(body.message);
        });

        clients.length = 0;
        ctx.res.statusCode = 200;
        ctx.res.end("ok");
        return resolve()
    })

}

