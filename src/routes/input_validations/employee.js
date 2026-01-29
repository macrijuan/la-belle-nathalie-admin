const { custom_error, unknown, strict_length, strict_char_type, strict_size, not_valid } = require("../../errors.js");

const nameVal = ( name, key ) => {
  if ( typeof name !== 'string' ) return unknown;
  const normalized = name.normalize( 'NFC' );
  if ( normalized.length < 1 || normalized.length > 35 ) {
    return custom_error( key, strict_length( key, 1, 35 ) );
  };
  if ( !( /^\p{L}+(?:\s\p{L}+)*$/u ).test( normalized ) ) {
    return custom_error( key, strict_char_type( key, 'letras y espacios (no consecutivos)' ) );
  };
};

const idenVal = ( iden ) => {
  if( typeof iden !== 'number' ) return unknown;
  if( iden < 45000000 || iden > 100000000 ) return custom_error( "identidad", strict_size( '45.000.000', '100.000.000' ) );
};

const shiftVal = ( shift ) => {
  if( typeof shift !== 'string' ) return unknown;
  if( !( shift === 'am' || shift === 'pm' ) ) return custom_error( "turno", not_valid( "turno" ) );
};

module.exports = { nameVal, idenVal, shiftVal };