
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

const chat = require('./chart.js');
const Router = require('koa-router');
const router = new Router();


router.get('/subscribe', async (ctx) => {
    await chat.subscribe(ctx);
});

router.post('/publish', async (ctx) => {
    await chat.publish(ctx);
});

app.use(router.routes());
app.listen(config.get('port'), console.log( 'server start on localhost:3000' ));



