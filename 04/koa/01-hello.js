// The simplest example of Koa

const Koa = require('koa');

const app = new Koa();

/**
 * Основные объекты:
 * ctx.req / ctx.res
 * ctx.request / ctx.response
 * ctx (контекст)
 *
 * Основные методы:
 * ctx.set/get
 * ctx.body=
 */

// app.middlewares = [func1, func2];
app.use(async function(ctx, next) { // context, next, ctx.request.body = {}
  if (ctx.url === '/favicon.ico') {
    await next();
    return;
  }

  /* sleep(1000); */
  await new Promise(res => setTimeout(res, 1000));

  // ctx.response.body = "hello"
  ctx.body = "hello"; // {result: "hello"}

});

app.listen(3000);
