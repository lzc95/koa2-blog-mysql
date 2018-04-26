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
                *
                FROM
                topics
                ORDER BY topics.createdAt DESC LIMIT ${(pageNum-1)*pageSize}, ${pageSize}`
    console.log(_sql);
    return query(_sql);
}

exports.getTopicsByUserId = (id,offset,limit,orderBy,order)=>{
    let _sql = `SELECT
                *
                FROM
                topics
                where topics.user_id = ${id}`
    if(offset&&limit){
        _sql+=` limit ${offset},${limit}`
    }
    if(orderBy,order){
        _sql+=` order by ${orderBy} ${order}`
    }
    return query(_sql);
}

exports.getTopicsById = (id)=>{
    let _sql = `SELECT * FROM topics WHERE topics.id = ${id}`
    return query(_sql);
}

exports.addPVCount = (id)=>{
    let _sql = `UPDATE topics set topics.pv=topics.pv+1 WHERE topics.id = ${id};`
    return query(_sql);
}

exports.getRepliesByTopicId = (id)=>{
    let _sql = `SELECT * FROM replies WHERE replies.topic_id = ${id}`;
    return query(_sql);
}

exports.getUserById = (id) =>{
    let _sql = `SELECT *
                FROM
                users
                WHERE
                users.id = ${id}`;
    return query(_sql);
}

exports.getUserByName = (name) =>{
    let _sql = `select * from users where users.name="${name}";`;
    return query(_sql);
}

exports.getUserByEmail = (email)=>{
    let _sql = `select * from users where users.email="${email}";`;
    return query(_sql);
}

exports.createUser = (userInfo)=>{
    let _sql = `insert into users set name=?,gender=?,password=?,email=?,signature=?`;
    return query(_sql,userInfo);
}



