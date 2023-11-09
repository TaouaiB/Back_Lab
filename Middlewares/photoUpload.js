const path = require("path"); //From js
const multer = require("multer");

// Photo Storage
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb : callback function ( error , destination )
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      // cb( error , file name , we use new date to get date then make it string 
      //then we remove : and replace with - , as windows doesn't accept : in file name , 
      //then the file name in user computer )
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    }else{  //if no file uploaded  
        cb(null, false);
    }
  },
});


// Photo Upload Middleware
const photoUpload = multer({
    storage:photoStorage,
    fileFilter : function(req,file,cb){
        //mimetype : file type 
        //we can add image/png for only png images type
        if (file.mimetype.startsWith("image")){
            // (no error, upload)
            cb(null, true)
        }else {
            // (error message , false :  don't upload)
            cb({ message : "unsupported file format"}, false)
        }
    },
    limits: { fileSize: 1024 * 1024} //1Megabyte { fileSize: 1024 * 1024 *5} => 5Mb
})

const photoSingleUpload = photoUpload.single("image");

module.exports = {  
    photoSingleUpload,
};