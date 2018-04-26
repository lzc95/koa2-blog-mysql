const model = require('../models/index');

const moment = require('moment');
const mditor = require('mditor');

const parser = new mditor.Parser();

moment.locale('zh-cn');

exports.readTopic = async function (ctx) {

    let replyUserNames = [];
    let replies = [];
    let topic = {};
    let authorTopics = [];
    let topicUser = {};
    let isAuthor = false;
    //获取对象形式的查询字符串
    /*console.log(ctx.request.query);*/
    let topicId = ctx.params.id
    if (typeof topicId != 'undefined') {
        let topicResult = await model.getTopicsById(topicId);
        topic = topicResult[0];
        await  model.addPVCount(topicId);
        replies = await  model.getRepliesByTopicId(topicId);
        for(let reply of replies){
            //解析成带有@格式的markdown原文，这样经过markdown解析就能在回复出现对某人的连接了
            // todo reply.content = parser.parse(At.linkUsers(reply.content));
            reply.content = parser.parse(reply.content);
            //使用moment，算出create到现在的汉语时间段字符串
            reply.fromNow = moment(reply.createdAt).fromNow();
            //查询此主题作者的基本信息
            let replyUser = await model.getUserById(reply.user_id);
            reply.author = replyUser;
            replyUserNames.push(replyUser.name);
        }
    }

    if(typeof topic!='undefined'){
        topic.fromNow = moment(topic.createdAt).fromNow();
        topic.content = parser.parse(topic.content);
        authorTopics = await model.getTopicsByUserId(topic.user_id,0,5,'createdAt','desc');
        topicUser = await model.getUserById(topic.user_id);
        replyUserNames.push(topicUser[0].name);
        if (typeof ctx.session.user !== 'undefined' && typeof ctx.session.user.id !== 'undefined') {
            if (topic.user_id === ctx.session.user.id) {
                isAuthor = true;
            }
        }
    }

    console.log(replies);

    var position = 'topic';
    await ctx.render('topic', {
        session: ctx.session,
        topic: topic,
        authorTopics: authorTopics,
        topicUser: topicUser,
        position: position,
        isAuthor: isAuthor,
        replies: replies,
        replyUserNames: replyUserNames,
        matches: [],
    });

}

exports.editTopic = async function(ctx){
    let topic = {};
    if (typeof ctx.params.id !== 'undefined') {
        result = await model.getTopicsById(ctx.params.id);
        topic = result[0];
    }
    if(topic){
        let position = 'editTopic';
        await ctx.render('topicEdit', {
            session: ctx.session,
            topic: topic,
            position: position,
        });
    }
}

exports.saveTopic = async function(ctx){
    let req = ctx.request.fields;
    let message = {};
    console.log(req);
    try {
        await model.updateTopic(req.topicId, req.title, req.content);
        message.result = true;
        ctx.body = message;
    }
    catch (err) {
        throw (err, 400);
    }
}

exports.createReply = async function(ctx){
    let req = ctx.request.fields;
    let message = {};
    if(ctx.session.user.id){
        let replyInfo = {
            user_id: ctx.session.user.id,
            topic_id: Number(req.topic_id),
            content: req.content
        };
        console.log(replyInfo);
        let result = await model.createReply(replyInfo);
        console.log(result);

        //todo 发送通知

        //增加回复数
        await model.addTopicReplyCount(replyInfo.topic_id);

        //更新文章的最新回复时间
        await model.updateTopicLastReplyInfo(replyInfo.topic_id,replyInfo.user_id,moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));

        //给用户添加积分
        await model.addIntegration(replyInfo.user_id,2);

        message.result = true;
        message.href = '/topic/' + replyInfo.topic_id + '#' + result.id;
        ctx.body = message;
    }
}