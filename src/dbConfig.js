const pg = require("pg");

module.exports = {
  dialectModule: pg,
  logging: false,
  native:false,
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true
    }
  },
  pool: {
    max: 2,
    min: 0,
    idle: 0,
    acquire: 4000,
    evict: process.env.CURRENT_LAMBDA_FUNCTION_TIMEOUT
  }
};