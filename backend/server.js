const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


// Routes Middleware
app.use("/api/users", userRoute);


// Routes
app.get("/", (req, res) => {
    res.send("Home Page");
  });

  // Routes
app.get("/", (req, res) => {
    res.send("Home Page");
  });


// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);	
        })
    })
    .catch((err) => console.log(err))