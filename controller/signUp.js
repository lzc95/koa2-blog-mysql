const model = require('../models/index');
exports.signUp = async function(ctx) {
    console.log(ctx);
    try {
        var data = ctx.request.body;
        console.log(data,"requrest===========data");
        let message = {};
        message.result = false;

        let user;
        //判断用户是否存在
        user = await model.getUserByName(data.name);
        console.log(user,"===============================");
        if(user.length){
            message.message = '用户名已注册';
            ctx.body = message;
            return;
        }
        //判断邮箱是否已经注册
        user = await model.getUserByEmail(data.email);
        console.log(user);
        if(user.length){
            message.message = '此邮箱已注册';
            ctx.body = message;
            return;
        }

        let res = await model.createUser([data.name,data.gender,data.password,data.email,data.signature])
        message.result = true;

        //从数据库中重新查找插入的用户信息放入session
        let userInfo = await model.getUserByName(data.name);

        ctx.session.user = userInfo;

        ctx.body = message;

    }catch (err){
        console.log(err,"============");
    }
}