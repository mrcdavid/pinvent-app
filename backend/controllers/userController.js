const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
	
	if(passwordIsCorrect){
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
		const { _id, name, password, email, photo, phone, bio, token} = user;
		res.status(200).json({
			_id,
			name,
			password,
			email,
			photo,
			phone,
			bio,
			token,
		});
	} else {
		res.status(400);
		throw new Error("User Not Found");
	}
});

module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	getUser
};
