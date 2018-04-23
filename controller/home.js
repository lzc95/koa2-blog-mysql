const model = require("../models/index");
const moment = require('moment');
moment.locale('zh-cn')

exports.getHome = async function(ctx){
    let pageCount; //主题的页数
    const onePageCount = 15; //一页的主题数量,其实配置不应该放这里
    let activePage = ctx.query.p || 1;//当前页
    let noReadMessageCount = 0;//没读取消息的数量
    let userTopics = [];

    const totalCount = await model.getTopcsCount();
    const topics = await model.getTopicsAndCount(1,onePageCount);
    pageCount = Math.ceil(totalCount/onePageCount);

    for(let i = 0; i< topics.length; i++){
        let item = topics[i];
        item.user = await model.getUserById(item.user_id);
        item.fromNow = moment(item.createdAt).fromNow();
        item.lastReplyFromNow = moment(item.last_reply_date_time).fromNow();
        item.lastCommentUser = await model.getUserById(item.last_reply_id);
        console.log(item.lastCommentUser);
    }

    //根据session获取用户信息
    console.log(ctx.session,"===================ctx session========================");
    if(typeof ctx.session.user != 'undefined' && typeof ctx.session.user.id != 'undefined'){
        userTopics = model.getTopicsByUserId(ctx.session.id);
        //更新用户基本信息，有很多时候用户不需要登录直接访问主页面
        ctx.session.user = await model.getUserById(ctx.session.id);

        //todo 查询没有读取的消息数量

    }

    var position = 'home';
    await ctx.render('home', {
        title: '主页',
        session: ctx.session,
        topics: topics,
        userTopics: userTopics,
        position: position,
        activePage: activePage,
        pageCount: pageCount,
        noReadMessageCount: noReadMessageCount,
        //todo 爬虫
        matches: [],
    });
}