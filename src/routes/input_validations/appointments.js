const { invalid_format } = require("../../errors.js");

const dayVal = ( day, rutErrs ) => {
  if(
    typeof day !== "string"
    || !(/^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).test( day )
  ) return rutErrs.day = [ invalid_format ];
  const selDate = new Date( day+"T03:00:00Z" );
  const selDateMoment = selDate.getTime();
  const now = new Date();
  const currentDate = new Date( now.getFullYear(), now.getMonth(), now.getDate() ).getTime();
  const nextMonthsLastDay = new Date( now.getFullYear(), now.getMonth()+2, 0 ).getTime();
  if(
    currentDate > selDateMoment
    || selDateMoment > nextMonthsLastDay
    || selDate.getDay() === 0
  ) rutErrs.day = invalid_format;
};

const timeVal = ( time, rutErrs, prop ) => {
  if(
    typeof time !== "string"
    || !( /^([0-1]\d|2[0-3]):[0-5]\d:00$/ ).test( time )
  ) rutErrs[ prop ] = invalid_format;
};

const idVal = ( id, rutErrs, prop ) => {
  if(
    typeof id !== "number"
    || id > 999
    || id < 1
  ) rutErrs[prop] = invalid_format;
};

module.exports = {
  dayVal,
  timeVal,
  idVal
};