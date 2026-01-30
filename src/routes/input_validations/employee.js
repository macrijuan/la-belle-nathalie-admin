const { custom_error, unknown, strict_length, strict_char_type, strict_size, not_valid } = require("../../errors.js");

const nameVal = ( name, key ) => {
  if ( typeof name !== 'string' ) return unknown;
  const normalized = name.normalize( 'NFC' );
  if ( normalized.length < 1 || normalized.length > 35 ) {
    return custom_error( key, strict_length( key, 1, 35 ) );
  };
  if ( !( /^\p{L}+(?:\s\p{L}+)*$/u ).test( normalized ) ) {
    return custom_error( key, strict_char_type( key, 'letters and not chained spaces' ) );
  };
};

const idenVal = ( iden ) => {
  if( typeof iden !== 'number' || Number.isNaN( iden ) ) return unknown;
  if( iden < 4000000 || iden > 100000000 ) return custom_error( "identity", strict_size( '45.000.000', '100.000.000' ) );
};

const shiftVal = ( shift ) => {
  if( typeof shift !== 'string' ) return unknown;
  if( !( shift === 'am' || shift === 'pm' ) ) return custom_error( "shift", not_valid( "shift" ) );
};

module.exports = { nameVal, idenVal, shiftVal };