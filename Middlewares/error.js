
// Not Found Middleware
    const notFound = (req, res, next) => {
        const error = new Error(`not found - ${req.originalUrl}`);  // Error : class in JS 
        res.status(404);
        next(error);  // next will check next middleware , example to errorHandler Middleware , and err message will go to err ( errorHandler = (err, req, res, next) ) then goes to message 
    }

// Error Handler Middleware  
const errorHandler = (err, req, res, next) => {    // error middleware is always special : err, req, res, next !!!!

    const statusCode= res.statusCode === 200 ? 500 : res.statusCode ;

    res.status(statusCode).json({
        message: err.message, // provide error message 
        stack: process.env.NODE_ENV === "production"? null : err.stack,   /// stack provides directory , location of the error !!!
    })
}

module.exports = {
    errorHandler,
    notFound
}