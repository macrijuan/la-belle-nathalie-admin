require("dotenv").config();
const { Redis } = require('@upstash/redis');


const cachedSessions = new Map();
let upstashClient = cachedSessions;

if( process.env.ENVIRONMENT !== 'development' ){
  upstashClient = new Redis({
    url: process.env.REDIS_HOST,
    token: process.env.REDIS_PASSWORD,
  } );
};
  
module.exports = { upstashClient, cachedSessions:() => cachedSessions };