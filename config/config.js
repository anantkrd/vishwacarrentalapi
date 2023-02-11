const fs = require('fs');

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    host: host:process.env.HOST,
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    host: host:process.env.HOST,
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    host: host:process.env.HOST,
    port: 3306,
    dialect: 'mysql',
    
  }
};