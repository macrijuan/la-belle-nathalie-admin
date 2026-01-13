const { is_mandatory, strict_size, custom_unknown } = require("../../errors.js");

const exerIdValidation = ( exer, errors ) => {
  if( typeof exer !== "number" || !exer || exer > 9999 ) return errors.exerId = custom_unknown;
};

const sersValidation = ( sers, errors ) => {
  if( typeof sers !== 'number' || !sers ) return errors.sers = [ is_mandatory( "series" ) ];
  if( sers > 20 ) errors.sers = [ strict_size( "series", 1, 20 ) ];
};

const repsValidation = ( reps, errors ) => {
  if( typeof reps !== 'number' || !reps ) return errors.reps = [ is_mandatory( "repetitions" ) ];
  if( reps > 50 ) errors.reps = [ strict_size( "repetitions", 1, 50 ) ];
};


module.exports = {
  exerIdValidation,
  sersValidation,
  repsValidation
};