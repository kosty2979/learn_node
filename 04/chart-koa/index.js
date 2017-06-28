// A "closer to real-life" app example
// using 3rd party middleware modules
// P.S. MWs calls be refactored in many files

// long stack trace (+clarify from co) if needed
if (process.env.TRACE) {
  require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();

const config = require('config');

const path = require('path');
const fs = require('fs');
const events = require('events');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));

const clients = [];

const Router = require('koa-router');

const router = new Router();

const em = new events.EventEmitter();



router.get('/subscribe', async (ctx) => {
     await subscribe(ctx);
});

router.post('/publish', async (ctx) => {
    await publish(ctx);
});

app.use(router.routes());

app.listen(config.get('port'), console.log(' server start on localhost:3000'));


function subscribe(ctx) {
    return new Promise((resolve, reject) => {
        em.once('message', function (data) {
            ctx.response.body = data;
            ctx.res.setHeader('Cache-Control', "no-cache, no-store, private");
            return resolve();
        });

        ctx.req.once('close', () => {
           // if( ctx.response.statusCode === 200 ) return;
            return resolve( console.error('session closed') );
        });

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

        em.emit('message', ctx.request.body.message);
        ctx.res.statusCode = 200;
        ctx.res.end("ok");
        return resolve()
    })

}

