const model = require('../models/index');
exports.login = async function(ctx) {
    try {
        var data = ctx.request.body;

        let message = {};
        message.result = false;

        //数据库返回的是个数组
        let userData = await model.getUserByEmail(data.email);
        let userInfo = userData[0];
        if(!userData.length){
            message.message = "用户不存在";
            ctx.body = message;
        }
        if(data.password!=userInfo.password){
            message.message = "用户密码输入有误";
            ctx.body = message;
        }

        ctx.session.user = userInfo;
        message.result = true;
        ctx.body = message;
    }catch (err){
        console.log(err,"============");
    }
}