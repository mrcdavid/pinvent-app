const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const jose = require("jose");
const { PUBLIC_KEY, PRIVATE_KEY } = require("../helper/helper");

const decryptToken = async (token) => {
	try {
		// const { payload } = await jose.jwtDecrypt(token, publicKey, {
		//   algorithms: ['RS256'],
		// });
		// return payload;
		return jose.jwtVerify(token, await jose.importSPKI(PUBLIC_KEY, "RS256"));
	} catch (error) {
		console.error(error);
		return null;
	}
};

const protect = asyncHandler(async (req, res, next) => {
	const token = req.cookies.token;
	console.log(token);
	try {
		
		if (!token) {
			res.status(401);
			throw new Error("Not authorized, no token");
		}
		
		await decryptToken(token)
		.then((payload) => {
			req.user = payload;
			console.log(req.user.payload);
			next();
		})
		.catch((error) => {
			console.error(error);
		});
	} catch (error) {
		console.error(error);
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});

module.exports = protect;
