const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const jose = require("jose");
const { PUBLIC_KEY, PRIVATE_KEY } = require('../helper/helper');

const decryptToken = async (token) => {
  try {
    // const { payload } = await jose.jwtDecrypt(token, publicKey, {
    //   algorithms: ['RS256'],
    // });
    // return payload;
    return jose.jwtVerify(
      token,
      await jose.importSPKI(PUBLIC_KEY, "RS256"),
    )
  } catch (error) {
    console.error(error);
    return null;
  }
};

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  decryptToken(token)
    .then((payload) => {
      req.user = payload;
      // console.log(req.user.payload.id); 
      next();
    })
    .catch((error) => {
      console.error(error);
    });

  // Decode Token
  // const decryptedToken = jose.jwtDecrypt(token, PUBLIC_KEY);
  // console.log(decryptedToken);

  // Verify Token
  // const verified = jose.jwtVerify(decryptToken, PUBLIC_KEY);
  // console.log(verified)
  // // Get user id from token
  // const user = await User.findById(verified._payload);

  // if (!user) {
  //   res.status(401);
  //   throw new Error("User not found");
  // }
  // req.user = user;
});



module.exports = protect;