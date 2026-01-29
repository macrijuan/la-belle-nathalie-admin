const { unknown } = require("../../errors.js");

const servNameVal = ( name ) => {
  if(
    typeof name !== 'string'
    || name.length > 35 
    || name.length < 1
  ){
    console.log( console.log( "INVALID NAME" ) );
    return unknown;
  };
};

const shiftVal = ( arrTime ) => {
  if(
    !Array.isArray( arrTime )
    || arrTime.length !== 2
    || typeof arrTime[ 0 ] !== 'string'
    || typeof arrTime[ 1 ] !== 'string'
  ){
    console.log( "ARRAY WITH EMPLOYEE SHIFT TIME MUST BE AN ARAY WITH 2 STRINGS" );
    return unknown;
  };
  if(
    !( /^(?:[01]\d|2[0-3]):[0-5]\d$/ ).test( arrTime[ 0 ] )
    || !( /^(?:[01]\d|2[0-3]):[0-5]\d$/ ).test( arrTime[ 1 ] )
    || !( arrTime[ 0 ] < arrTime[ 1 ] )
  ){
    console.log( "arrTime: ", arrTime );
    console.log( "STRINGS INSIDE ARRAY OF EMPLOYEE SHIFT TIME MUST REPRESENT TIME IN HH:MM FORMAT AND THE FIRST VALUE MUST BE SMALLER THAN THE SECOND" );
    return unknown;
  };
};

module.exports = {
  servNameVal,
  shiftVal
};