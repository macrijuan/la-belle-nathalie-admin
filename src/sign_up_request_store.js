
require("dotenv").config();

const signUpReqStore = new Map();
let upstashClient = signUpReqStore;

// if( process.env.ENVIRONMENT !== 'development'){
//   //Upstash logic here
// };
  
module.exports = { upstashClient, signUpReqs:() => signUpReqStore };