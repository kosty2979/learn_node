
exports.init = app => app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if(e.name ='ValidationError'){
        const error = Object.keys(e.errors).map(key => {
         return {[e.errors[key].path] : e.errors[key].message}
        });
        ctx.status = 400;
        ctx.body = error;
        return
      }
    if (e.status) {
      // could use template methods to render error page
      ctx.body = e.message;
      ctx.status = e.status;
    } else {
      ctx.body = 'Error 500';
      ctx.status = 500;
      console.error(e.message, e.stack);
    }

  }
});
