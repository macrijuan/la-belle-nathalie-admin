const serverless = require("serverless-http");
const express = require("express");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const server = express();

const sign_in = require("../../src/routes/user/post/sign_in.js");
const sign_up = require("../../src/routes/user/post/sign_up_index.js")
const password_recovery = require("../../src/routes/user/update/password/recovery/index.js");
const session_getter = require("../../src/routes/session_getter.js");
const authenticate = require("../../src/routes/authenticate.js");
const routes = require("../../src/routes/index.js");
const { unknown, req_limit } = require("../../src/errors.js");

server.name = 'La Belle Nathalie';

server.use(
  rateLimit( {
    windowMs: 30000,
    max: 500,
    keyGenerator: ( req ) => {
      return req.session?.user?.id || req.ip;
    },
    handler: ( req, res ) => {
      res.status( 429 ).json( req_limit );
      console.log( 'Request limit reached for IP:', req.ip );
    }
  } )
);

server.use( bodyParser.urlencoded( { extended: true } ) );
server.use( bodyParser.json( { limit: '50mb' } ) );
server.use( cookieParser() );

server.use( ( req, res, next ) => {
  res.header( 'Access-Control-Allow-Origin', 'https://labellenathalie.vercel.app' );
  res.header( 'Access-Control-Allow-Credentials', 'true' );
  res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, X-Csrf-Token' );
  res.header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE' );
  res.header( 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload' );
  next();
} );

server.options( '*', ( req, res ) => {
  res.setHeader( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, X-Csrf-Token' );
  res.status( 200 ).end();
} );

server.use( '/.netlify/functions/api', sign_in, sign_up, password_recovery, session_getter, authenticate, routes );

server.use( ( err, req, res, next ) => {
  console.error( err );
  console.log("ERROR ENDWARE");
  res.status( 500 ).json( unknown );
} );

module.exports.handler = serverless( server );