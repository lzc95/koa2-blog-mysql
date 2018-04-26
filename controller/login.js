const model = require('../models/index');
const crypto = require('crypto');
exports.login = async function(ctx) {
    try {
        var data = ctx.request.fields;

        let message = {};
        message.result = false;

        //数据库返回的是个数组
        let userData = await model.getUserByEmail(data.email);
        let userInfo = userData[0];
        if(!userData.length){
            message.message = "用户不存在";
            ctx.body = message;
        }

        //将用户的密码加密与数据库比对
        data.password = crypto.createHash('md5').update(data.password).digest('hex');

        if(data.password!=userInfo.password){
            message.message = "用户密码输入有误";
            ctx.body = message;
        }

        ctx.session.user = userInfo;
        console.log(ctx.session.user,"===============login ctx session===================")
        message.result = true;
        ctx.body = message;
    }catch (err){
        console.log(err,"============");
    }
}