const Koa = require('koa');
// const cors = require('koa-cors');
const json = require('koa-json');
const views = require('koa-views');
const serve = require('koa-static');
/*
* koa-bodyparser不支持form-date类型的数据
* */
//const bodyParser = require('koa-bodyparser');
const body = require('koa-better-body');
const session = require('koa-session');
const Redis = require("ioredis");
const path = require("path");
const logger = require('koa-logger');

// 引入路由
const router = require('./routes/index');
// cors要放在router后面才生效
const cors = require('koa-cors');

const app = new Koa();
// 日志
app.use(logger())

// 设置Header，这个header会输出给浏览器客户端，表明这个框架是什么生成的，可以自行修改
app.use(async(ctx, next) => {
    await next()
    ctx.set('X-Powered-By', 'Koa2');
})

/**
 * 默认关闭，需同上面的Store一起关掉注释
 * 使用自定义存储，这里面用的是Redis缓存，好处是
 * session 存放在内存中不方便进程间共享，因此可以使用 redis 等缓存来存储 session。m
 * 假设你的机器是4核的，你使用了4个进程在跑同一个node web服务，当用户访问进程1时，他被设置了一些数据当做session存在内存中。
 * 而下一次访问时，他被负载均衡到了进程2，则此时进程2的内存中没有他的信息，认为他是个新用户。这就会导致用户在我们服务中的状态不一致。
 */
//todo 写入redis
//app.keys = ['tom-field'];
const redis = new Redis();
const Store = {
    get: async function(sid){
        let data = redis.get(`SESSION:${sid}`);
        return data;
    },
    set: async function(session, opts){
        await redis.set(`SESSION:${opts.sid}`, JSON.stringify(session));
        return opts.sid;
    },
    destroy: async function(sid){
        return redis.del(`SESSION:${sid}`);
    }
}
app.keys = ['i am tom-field'];
const sessionConfig = {
    key:'tom-field',
    maxAge:86400000,
    overwrite: true,
    //store: Store,
}
app.use(session(sessionConfig,app));

// 设置跨域
//我的网页服务器和数据库服务器域名不一样,应该是资源的限制；同一域名和同一端口
app.use(cors())

// 传输JSON
app.use(json())

// body解析
app.use((body({
    uploadDir: path.join(__dirname, 'uploads'),
    keepExtensions: true
})))

// 设置渲染引擎
app.use(views(__dirname + '/views', {//这里应该是包含了ejs和别的一些，这里把扩展给限定为ejs
    extension: 'ejs'
}))

// 静态文件夹
app.use(serve(__dirname + '/public/'));

//路由，最后处理到达路由，再由路由分发到相应的处理controller,这里是简单的MVC模型
app.use(router.routes())

app.use(async(ctx) => {
    if (ctx.status === 404) {
        await ctx.render('./error/404');
    }
})

app.listen(process.env.PORT || 4001)//这里监听端口

console.log(`Server up and running! On port  ${process.env.PORT || 4001} !`);






