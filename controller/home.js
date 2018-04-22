const model = require("../models/index");

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
        item.user = await model.getTopicsByUserId(item.user_id);
        item.fromNow = item.createdAt;
        item.lastReplyFromNow = item.last_reply_date_time;
        item.lastCommentUser = await model.getUserById(item.last_reply_id);
        console.log(item.lastCommentUser);
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