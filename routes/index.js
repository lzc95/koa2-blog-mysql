const Router = require("koa-router");
const router = new Router();
const home = require("../controller/home");
const signUp = require("../controller/signUp");
const login = require("../controller/login");
//todo 路由拆分 为了方便暂时不拆分
//用户相关路由
router.get('/',home.getHome);

//注册
router.get('/signup', async(ctx) => {
    await ctx.render('signup', {title: '注册界面', session: ctx.session})
})
router.post('/signup',signUp.signUp);
//登录
router.get('/login',async(ctx)=>{
    console.log(ctx.session);
    await ctx.render('login', {title: '登录界面', session: ctx.session});
})
router.post('/login',login.login);

module.exports =  router;