const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

/*
token cannot be stored in the request body,
since not all middleware we need the token for have a body.
such as get and delete requests

it could be in the query (end of the url after the ?) : ....?token=toKeN23

we'll use headers: keeps the url clean and tokens are valid metadata to be stored in the headers
headers are key-value pairs
in app.js we have allowed Authorization headers, so we have access to them here
note: headers are case insensitive
*/
module.exports = (req, res, next) => {
  /*
  PREFLIGHT REQUEST:
  A CORS preflight request is a CORS request that checks to see if the CORS protocol is understood
  and a server is aware using specific methods and headers.
  It is an OPTIONS request, using two or three HTTP request headers:
  Access-Control-Request-Method, Origin, and optionally Access-Control-Request-Headers.

  it is essentially asking the server whether it will allow the upcoming non-GET request
  */
  if(req.method === 'OPTIONS') return next(); 
  let token;
  try {
    console.log('1: '+req.headers)
    token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN' so we need the second part
    console.log('2: '+token)
    if (!token) throw new Error();
    const decodedToken = jwt.verify(token, process.env.PRIVATE_KEY);
    console.log('3: '+decodedToken)
    req.userData = { userId: decodedToken.userId }; // this is the id os the user WHO SENT THE REQUEST
    next();
  } catch (error) {
    return next(new HttpError("authentication failed", 403));
  }
};
