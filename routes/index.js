const Router = require("koa-router");
const router = new Router();
const home = require("../controller/home");
const signUp = require("../controller/signUp");
const login = require("../controller/login");
const topic = require("../controller/topic");
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

//登出
router.get('/logout', async(ctx) => {
    //删除session信息
    ctx.session = null;
    await ctx.redirect('/');
})

//话题
router.get('/topic/:id',topic.readTopic)
//编辑主题
router.get('/topic/:id/edit',topic.editTopic)
//提交编辑主题
router.post('/topic/edit',topic.saveTopic)
//主题添加回复
router.post('/topic/createReply',topic.createReply)

module.exports =  router;