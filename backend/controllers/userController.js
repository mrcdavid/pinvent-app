const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const jose = require("jose");
const fs = require('fs');
const { PUBLIC_KEY, PRIVATE_KEY } = require('../helper/helper');
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
	payload = { 
		id: id,
		exp: Math.floor(Date.now() / 1000) + (60 * 60)
	 };
	return jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256'});
};

// const generateToken = (id) => {
// 	return new jose.SignJWT({ id }, PRIVATE_KEY, { expiresIn: "1d" });
// };

// const generateToken = (id) => {
// 	return new jose.SignJWT({ id }, PRIVATE_KEY, { expiresIn: "1d" });
// };

// Register User
const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	// Validation
	if (!name || !email || !password) {
		res.status(400);
		throw new Error("Please fill in all required fields");
	}
	if (password.length < 6) {
		res.status(400);
		throw new Error("Password must be at least 6 characters");
	}

	// Check if user email already exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("Email has already been registered");
	}

	// Create new user
	const user = await User.create({
		name,
		email,
		password,
	});

	// Generate token
	const token = generateToken(user._id);

	// Send HTTP-only cookie
	res.cookie("token", token, {
		path: "/",
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 86400), // 1 day
		sameSite: "none",
		secure: true,
	});

	if (user) {
		const { _id, name, email, photo, phone, bio } = user;
		res.status(201).json({
			_id,
			name,
			email,
			photo,
			phone,
			bio,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Invalid user data");
	}
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	// Validate Request
	if (!email || !password) {
		res.status(400);
		throw new Error("Please add email and password");
	}

	// Check if user exists
	const user = await User.findOne({ email });

	if (!user) {
		res.status(400);
		throw new Error("User not found, please signup");
	}

	// User exists, check if password is correct
	const passwordIsCorrect = await bcrypt.compare(password, user.password);

	//   Generate Token
	const token = generateToken(user._id);

	if (passwordIsCorrect) {
		// Send HTTP-only cookie
		res.cookie("token", token, {
			path: "/",
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 86400), // 1 day
			sameSite: "none",
			secure: true,
		});
	}
	if (user && passwordIsCorrect) {
		const { _id, name, email, photo, phone, bio, token} = user;
		res.status(200).json({
			_id,
			name,
			email,
			photo,
			phone,
			bio,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Invalid email or password");
	}
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({
		message: "Successfully Logged out",
	});
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.payload.id);

	// if (user) {
	// 	res.status(200);
	// 	const { _id, name, password, email, photo, phone, bio } = user;
	// 	res.status(200).json({
	// 		_id,
	// 		name,
	// 		password,
	// 		email,
	// 		photo,
	// 		phone,
	// 		bio,
	// 	});
	// } else {
	// 	res.status(400);
	// 	throw new Error("User Not Found");
	// }
	if (!user) {
		res.status(400);
		throw new Error("User Not Found");
	}
	res.status(200);
		const { _id, name, password, email, photo, phone, bio } = user;
		res.status(200).json({
			_id,
			name,
			password,
			email,
			photo,
			phone,
			bio,
		});
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
	const token = req.cookies.token;
	if (!token) {
		return res.json({
			"Message": "User is not logged in",
		});
	}
	// Verify Token
	const verified = jose.JWT.verify(token, PUBLIC_KEY);
	if (verified) {
		console.log(verified);
		return res.json({
			"Message": "User is logged in",
		});
	}
	return res.json({
		"Message": "User is not logged in",
	});
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		const { name, email, photo, phone, bio } = user;
		user.email = email;
		user.name = req.body.name || name;
		user.phone = req.body.phone || phone;
		user.bio = req.body.bio || bio;
		user.photo = req.body.photo || photo;

		const updatedUser = await user.save();

		res.status(200).json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			photo: updatedUser.photo,
			phone: updatedUser.phone,
			bio: updatedUser.bio,
		});
	} else {
		res.status(400);
		throw new Error("User Not Found");
	}
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	const { oldPassword, password } = req.body;

	if (!user) {
		res.status(400);
		throw new Error("User not found, please signup");
	}
	//Validate
	if (!oldPassword || !password) {
		res.status(400);
		throw new Error("Please add old and new password");
	}

	// check if old password matches password in DB
	const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

	// Save new password
	if (user && passwordIsCorrect) {
		user.password = password;
		await user.save();
		logoutUser(req, res);
		return res.status(200).send("Password change successful");
	} else {
		res.status(400);
		throw new Error("Old password is incorrect");
	}

});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });


	if (!user) {
		// If user doesn't exist, return an error
		return res.status(400).json({
			error: 'User not found.'
		});
	}

	// Check if the email provided matches the email associated with the user's account
	if (user.email !== email) {
		// If the email doesn't match, return an error
		return res.status(400).json({
			error: 'Email does not match.'
		});

	}
	// Generate Token
	// const newToken = jose.SignJWT({ email: user.email }, PRIVATE_KEY, { expiresIn: '1d', algorithm: 'RS256' });
	// if (newToken) {
	// 	res.send(newToken);
	// } else {
	// 	res.status(400);
	// 	throw new Error("Invalid Token");
	// }

	const alg = 'RS256'
	const privateKey = await jose.importPKCS8(PRIVATE_KEY, alg)

	const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer('urn:example:issuer')
		.setAudience('urn:example:audience')
		.setExpirationTime('2h')
		.sign(privateKey)

	// Construct Reset Url
	const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${jwt}`;

	// Reset Email
	const message = `
			<h2>Hello ${user.name}</h2>
			<p>Please use the url below to reset your password</p>
			<p>This reset link is valid for only 30 minutes</p>
			<a href="${resetUrl} clickedtracking=off">${resetUrl}</a>
		
			<p>If you did not request this email, please ignore it</p>
			<p>Thank you</p>
			<p>Pinvent Team</p>`;

	const subject = "Password Reset Request";
	const send_to = user.email;
	const send_from = process.env.EMAIL_USER;

	try {
		await sendEmail(subject, message, send_to, send_from);
		res.status(200).json({
			success: true,
			message: "Password reset link sent to your email",
		});
	} catch (error) {
		res.status(500);
		throw new Error("Email not sent, please try again");
	}
	res.send("Forgot Password");
});


// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
	const { password } = req.body;
	const { newToken } = req.params;
	try {
		const decodedToken = await jose.jwtVerify(newToken, PUBLIC_KEY, { algorithms: ['RS256'] });
		res.send(decodedToken);
	} catch (err) {
		console.error(err);
		res.status(401).send('Invalid or expired token');
	}
});


module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	getUser,
	loginStatus,
	updateUser,
	changePassword,
	forgotPassword,
	resetPassword
};
