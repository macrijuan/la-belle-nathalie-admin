const locals_setter = ( res, model, notFoundData )=>{
  res.locals.model = model;
  res.locals.notFoundData = notFoundData;
};

module.exports = locals_setter;