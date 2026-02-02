const subServNameVal = ( name ) => {
  if(
    typeof name !== 'string'
    || name.length > 35 
    || name.length < 1
  ){
    console.log( console.log( "INVALID NAME" ) );
    return unknown;
  };
};

const subServMinsVal = ( mins ) => {
  if(
    typeof mins !== 'number'
    || mins > 420
    || mins < 1
  ){
    console.log( console.log( "INVALID MINS" ) );
    return unknown;
  };
};

const subServDetailVal = ( detail ) => {
  if(
    typeof detail !== 'string'
    || detail.length > 500
    || detail.length < 1
  ){
    console.log( console.log( "INVALID MINS" ) );
    return unknown;
  };
};

const subServServIdlVal = ( servId ) => {
  if(
    typeof servId !== 'number'
    || servId > 10000
    || servId < 1
  ){
    console.log( console.log( "INVALID MINS" ) );
    return unknown;
  };
};

module.exports = { subServNameVal, subServMinsVal, subServDetailVal, subServServIdlVal };