const { custom_error, is_mandatory, strict_length, unknown } = require("../../errors.js");

const name_validation = ( name, errors ) => {
  if( typeof name !== 'string' ) return errors.name = [ is_mandatory("name") ];
  if( name.length > 30 || name.length < 3 ) errors.name = [ strict_length( "name", 3, 30 ) ];
};

const start_date_validation = ( start_date, errors ) => {
  if( 
    typeof start_date !== 'string'
    || !( /^[.\d]{4}-[\d]{2}-[\d]{2}$/ ).test( start_date )
  ) return errors.start_date = [ is_mandatory( "start date" ) ];
  const date = new Date( start_date );
  const currentDateWithTime = new Date();
  const monthDayNumber = currentDateWithTime.getDate()
  const currentDate = new Date(`${ currentDateWithTime.getFullYear() }-${ 1+currentDateWithTime.getMonth() }-${ monthDayNumber > 10 ?monthDayNumber :"0"+monthDayNumber }` );
  if( currentDate.getTime() > date.getTime() ) return errors.start_date = [ is_mandatory( "start date" ) ];
  const data = start_date.split( "-" );
  if(
    data.length !== 3
    || data[ 0 ] > 2100
  ) errors.start_date = [ is_mandatory( "start date" ) ];
};

module.exports = {
  name_validation,
  start_date_validation,
};