const Router = require("koa-router");
const router = new Router();
const home = require("../controller/home");
//todo 路由拆分 为了方便暂时不拆分
//用户相关路由
router.get('/',home.getHome)

module.exports =  router;