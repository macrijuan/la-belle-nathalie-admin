const doubleSpaceEraser = ( data )=>{
  while( data.includes("  ") ){
    data = data.replace( "  ", " " );
  };
  return data;
};

module.exports = {
  doubleSpaceEraser
};