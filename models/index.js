const mysql = require('mysql');
const config = require('../config/database.json');

const pool = mysql.createPool({
    host:config.host,
    user:config.userName,
    password:config.password,
    database:config.databaseName,
    port:config.port,
});

const query = (sql,values)=>{
    return new Promise((resolve,reject)=>{
        pool.getConnection((err,connection)=>{
            if(err){
                reject(err);
            }else{
                connection.query(sql,values,(err,rows)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(rows);
                    }
                    connection.release();
                })
            }
        })
    })
}
//查詢主題总数
exports.getTopcsCount = async ()=>{
    let _sql = `select COUNT(*) as totalCount FROM topics`;
    const result = await query(_sql);
    return result[0].totalCount;
}
//查询分页查询主题
exports.getTopicsAndCount = (pageNum,pageSize) =>{
    let _sql = `SELECT
                topics.id,
                topics.user_id,
                topics.title,
                topics.content,
                topics.pv,
                topics.reply_count,
                topics.allow_comment,
                topics.is_public,
                topics.last_reply_id,
                topics.last_reply_date_time,
                topics.createdAt,
                topics.updatedAt
                FROM
                topics
                LIMIT ${(pageNum-1)*pageSize}, ${pageSize}`
    console.log(_sql);
    return query(_sql);
}

exports.getTopicsByUserId = (id)=>{
    let _sql = `SELECT
                topics.id,
                topics.user_id,
                topics.title,
                topics.content,
                topics.pv,
                topics.reply_count,
                topics.allow_comment,
                topics.is_public,
                topics.last_reply_id,
                topics.last_reply_date_time,
                topics.createdAt,
                topics.updatedAt
                FROM
                topics
                where topics.user_id = ${id}
                `
    return query(_sql);
}

exports.getUserById = (id) =>{
    let _sql = `SELECT
                users.id,
                users.name,
                users.password,
                users.email,
                users.gender,
                users.signature,
                users.personalWeb,
                users.GitHub,
                users.avatarUrl,
                users.integration,
                users.createdAt,
                users.updatedAt
                FROM
                users
                WHERE
                users.id = ${id}`;
    console.log(_sql);
    return query(_sql);
}



