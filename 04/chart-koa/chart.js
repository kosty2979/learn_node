const clients = [];

exports.subscribe = function (ctx) {
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

exports.publish = function (ctx) {
    return new Promise( (resolve, reject) => {
        let body = ctx.request.body;
        if( !body.message ){
            ctx.res.statusCode = 413;
            ctx.res.end("no message");
            return  resolve();
        }
        body.message = String(body.message);
        if( !body.message.trim() ){
            ctx.res.statusCode = 413;
            ctx.res.end("no message");
            return  resolve();
        }

        if ( body.message.length > 100 ) {
            ctx.res.statusCode = 413;
            ctx.res.end("Your message is too big for my little chat");
            return  resolve();
        }

        clients.forEach(( sendMessage ) => {
            sendMessage(body.message);
        });

        clients.length = 0;
        ctx.res.statusCode = 200;
        ctx.res.end("ok");
        return resolve();
    })

};
