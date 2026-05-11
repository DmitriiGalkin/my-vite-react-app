'use strict';
const mysql = require('mysql2');

const dbConn = mysql.createConnection({
    host: process.env.DB_HOST ?? 'host',
    user: process.env.DB_USER ?? 'user',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_DATABASE ?? 'database',
});

dbConn.connect(function(err) {
    if (err) throw err;
    console.log("Server connected database on port 3306");
});

dbConn.query("SET SESSION wait_timeout = 604800"); // 7 days timeout
dbConn.query(`SET time_zone='+00:00'`, function (err, res) {
});


module.exports = dbConn;