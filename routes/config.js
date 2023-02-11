const conn= require('mysql');
var pool=conn.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'prayag'
});
module.exports = pool;
