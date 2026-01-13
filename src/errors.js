const custom_error = ( dataName, data ) => { return { errors:{ [dataName]: data } }; };

module.exports={
  custom_error,
  multi_errors: ( data ) => { return { errors: data }; },
  //SINGLE ERROR WITH CUSTOM DATA.
  not_found: ( dataName ) => custom_error( "not_found", `${dataName} not found.` ),
  sign_in_not_found: ( dataName ) => custom_error( "sign_in_not_found", `There is no ${dataName} with such email and password.\nCheck the entered data.`  ),
  //SINGLE ERROR WITH FIXED MESSAGE.
  req_limit: { errors:{ req_limit: 'Too many requests, please try again later.' } },
  no_session: { errors: { session: "The session has expired. Please, log in again." } },
  unknown: { errors:{ unknown: "An unknown error occured." } },
  //ERROR TO FILL AND "ERRORS" OBJECT (must return a string).
  not_valid: ( data ) => `The entered ${ data } isn't valid`,
  is_mandatory: ( dataName )=>`The ${dataName} field is mandatory`,
  strict_length: ( dataName, min, max ) =>`The ${dataName} field must contain between ${min} and ${max} characters.`,
  strict_size: ( dataName, min, max ) => `The ${dataName} value must be between ${min} and ${max}.`,
  strict_char_type: ( dataName, types ) =>`The ${dataName} field can only contain ${types}.`,
  at_least_one: ( dataName, data ) => `The ${dataName} field must contain at least one ${data}.`,
  cant_contain: ( dataName, data ) => `The ${dataName} field can't contain ${data}.`,
  existing: ( data ) => `This ${data} is already registered.`,
  auth: ( data ) => custom_error( "auth", `This ${data} is not authorized.` ),
  //MESSAGES
  unknown_to_fill: "An unknown error occured.",
  invalid_format: "The recived information format is not valid."
};