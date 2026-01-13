const { unknown } = require("../../errors");

const timeValidation = ( time ) => {
  if(
    typeof time !== "string"
    || time.length !== 5
    || !( /^(?:[01]\d|2[0-3]):[0-5]\d$/ ).test( time )
  ){
    console.log( "TIME FORMAS IS NOT VALID" );
    return unknown;
  };
};

module.exports = {
  timeValidation
};