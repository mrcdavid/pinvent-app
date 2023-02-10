const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

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
		const tokenize = req.signedCookies;
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
		const { _id, name, email, photo, phone, bio } = user;
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

// Another method to Logout User
const logoutUser = asyncHandler(async (req, res) => {
	res.cookie("token", "", {
		path: "/",
		httpOnly: true,
		expires: new Date(0), // 1 day
		sameSite: "none",
		secure: true,
	});
	return res.status(200).json({ message: "Successfully Logged out" });
});

// Logout User
// const logoutUser = asyncHandler(async (req, res) => {
// 	res.clearCookie("token");
// 	res.status(200).json({
// 		message: "Successfully Logged out",
// 	});
// });

// Get User Data
const getUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
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
	} else {
		res.status(400);
		throw new Error("User Not Found");
	}
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
	const token = req.cookies.token;
	if (!token) {
		return res.json(false);
	}

	// verify token
	const verified = jwt.verify(token, process.env.JWT_SECRET);
	if (verified) {
		return res.json(true);
	}
	return res.json(false)
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
	if (!user) {
		res.status(400);
		throw new Error("User not found, please signup");
	}

	const { oldPassword, newPassword } = req.body

	// Validate Request
	if (!oldPassword || !newPassword) {
		res.status(400);
		throw new Error("Please add old password and new password");
	}

	// User exists, check if password is correct
	const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

	if (user && passwordIsCorrect) {
		user.password = newPassword;
		await user.save();
		res.status(200).json("Password changed successfully");
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
		res.status(404);
		throw new Error("User does not exist");
	}

	// Create reset token
	let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

	// Hash token before saving to database
	const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	// Save hashed token to database
	await new Token({
		userId: user._id,
		token: hashedToken,
		createdAt: Date.now(),
		expiresAt: Date.now() + 30 * (60 * 1000), // thirty minutes
	}).save();

	// Construct Reset Url
	const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

	// Reset Email
	const message = `
		<h2>Hello ${user.name}</h2>
		<p>Please use the url below to reset your password</p>
		<p>This reset link is valid for only 30 minutes</p>
		<a href="${resetUrl} clickedtracking=off">${resetUrl}</a>
		
		<p>If you did not request this email, please ignore it</p>
		<p>Thank you</p>
		<p>Pinvent Team</p>`

	console.log(resetToken)
	res.send("Forgot Password");
});

module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	getUser,
	loginStatus,
	updateUser,
	changePassword,
	forgotPassword
};
