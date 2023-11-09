const express = require("express");
const connectToDb = require("./Config/connectToDb");

const xss = require("xss-clean"); // Middleware to prevent XSS attacks
const helmet = require("helmet"); // Middleware Security Headers
const hpp = require("hpp"); // Middleware Prevent Http Param Pollution

const{ errorHandler, notFound }= require("./Middlewares/error");
const cors = require("cors");
require("dotenv").config();

// Connection to DB
connectToDb();

// init app
const app = express();

// Middlewares
app.use(express.json());

// Prevent XSS (Cross Site Scripting) Attacks
// Should be ALWAYS above Routes !!!
app.use(xss());

// Security Headers ( Helmet )
// Add Security Headers to Response
app.use(helmet());

// Prevent Http Param Pollution (HPP)
app.use(hpp());

// CORS Policy
app.use(cors({
  origin: "http://localhost:3000"   //provide service only to this domain 
}))

//Routes
app.use("/api/auth",require("./Routes/authRoute"));
app.use("/api/users",require("./Routes/usersRoute"));
app.use("/api/posts",require("./Routes/postsRoute"));
app.use("/api/comments",require("./Routes/commentsRoute"));
app.use("/api/categories",require("./Routes/categoriesRoute"));
app.use("/api/password",require("./Routes/passwordRoute"));

//ERROR Handler Middleware SHOULD BE AFTER ROUTE !!!!!!!! 
app.use(notFound); // notFound should be before error handler cause of next()
app.use(errorHandler);

app.use((req,res) => {
  res.send("API is running ...")
})


//Running the Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT} `
  );
});
