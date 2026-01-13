const { not_valid, is_mandatory, strict_length, strict_char_type, cant_contain, at_least_one, strict_size, unknown_to_fill } = require("../../errors.js");
//passwordVal tests below.
const specChars = /^[@$!%*?&]{1,32}$/;//test 1
const lowercase = /^[a-zà-ÿ]{1,32}$/;//test 2
const uppercase = /^[A-ZÀ-Ý]{1,32}$/;//test 3
const number = /^[\d]{1,32}$/;//test 4
//emailVal tests below
const emailFormat = /^[0-9a-z]{1,}@[a-z]{1,}[.]com.{0,}$/;

const emailVal = ( email, errors ) => {
  console.log( email );
  if(typeof email !== "string"){
    errors.email = unknown_to_fill;
  }else{
    if( email.length < 7 || email.length > 254 ){ errors.email = [ not_valid( "email" ) ]; return; };
    if( !emailFormat.test( email ) ){ errors.email = [ not_valid( "email" ) ]; return; };
  };
};

const passwordVal = ( password, errors ) => {
  if(typeof password !== "string"){ errors.password = unknown_to_fill; return; };
  const approved = [];
  password.split("").forEach(e=>{
    if( specChars.test( e ) && !approved.includes( 1 ) ) approved.push( 1 );
    if( lowercase.test( e ) && !approved.includes( 2 ) ) approved.push( 2 );
    if( uppercase.test( e ) && !approved.includes( 3 ) ) approved.push( 3 );
    if( number.test( e ) && !approved.includes( 4 ) ) approved.push( 4 );
  });
  const passwordErrs = [];
  if ( !approved.includes( 1 ) ) passwordErrs.push( at_least_one( "password","of the following special characters inside the brackets (brackets not included) [ @ $ ! % * ? & ]" ) );
  if ( !approved.includes( 2 ) ) passwordErrs.push( at_least_one( "password","lowercase letter" ) );
  if ( !approved.includes( 3 ) ) passwordErrs.push( at_least_one( "password","uppercase letter" ) );
  if ( !approved.includes( 4 ) ) passwordErrs.push( at_least_one( "password","number" ) );
  if ( password.length<8 || password.length>32) passwordErrs.push( strict_length( "password", 8, 35 ) );
  if ( password.split( "" ).includes( " " ) ) passwordErrs.push( cant_contain( "password", "spaces" ) );
  if( passwordErrs.length ) errors.password = passwordErrs;
};

const nameVal = ( name, errors, prop, dataInMsg ) => {
  if( typeof name !== "string" || !name.length ) errors[ prop ] = is_mandatory( dataInMsg );
  else if( name.length < 2 || name.length > 35 ) errors[ prop ] = strict_length( dataInMsg, 2, 35 );
};

const identityVal = ( identity, errors ) => {
  if(
    typeof identity !== "string"
    || !identity
  ){ errors.identity = [ is_mandatory( "identity" ) ]; return; };
  identity = Number( identity );
  errors.identity = [];
  if( identity % 1 !== 0 ) errors.identity.push( strict_char_type( "identity", "an integer number" ) );
  if( identity > 99999999 || identity < 1 ) errors.identity.push( strict_size( "identity", 1, 99999999 ) );
  if( !errors.identity.length ) delete errors.identity;
};

const tokenVal = ( token, errors ) => {
  if(
    typeof token !== "string"
    || token.length !== 6
  ) errors.token = not_valid( "token" );
};


module.exports = {
  emailVal,
  passwordVal,
  nameVal,
  identityVal,
  tokenVal
};