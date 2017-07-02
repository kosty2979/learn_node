
if (process.env.TRACE) {
    require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();
const config = require('config');
const path = require('path');
const fs = require('fs');

const User = require('./mongo/user');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));


const Router = require('koa-router');
const router = new Router();


router.get('/users', async (ctx) => {
    ctx.body = await User.find({});
});

router.post('/users', async (ctx) => {
    await User.create({
        email: ctx.request.body.email,
        displayName: ctx.request.body.name
    });
    ctx.body = 'ok'
});

router.get('/users/:id', async (ctx)=> {
    try {
        const user = await User.findById(ctx.params.id)
        if(user) ctx.body = user;
    } catch(e){
        ctx.status = 404;
    }

})

router.patch('/users/:id', async (ctx) => {
    const update={};
    if(ctx.request.body.email) update.email = ctx.request.body.email;
    if(ctx.request.body.name) update.displayName = ctx.request.body.name;

    const user = await User.findByIdAndUpdate(
        ctx.params.id, update, { new: true, runValidators: true }
    );
    if(user)ctx.body = user;
});

router.delete('/users/:id', async (ctx) => {
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (user) ctx.body = 'ok'
});

app.use(router.routes());
app.listen(config.get('port'),  config.get('host'),  console.log( 'server start on localhost:3000' ));
