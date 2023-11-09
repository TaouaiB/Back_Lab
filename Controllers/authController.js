const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateRegisterUser, validateLoginUser } = require("../Models/User");
const VerificationToken = require("../Models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


/**-----------------------------------------------------
*   @desc Register New User 
*   @route /api/auth/register
*   @method POST
*   @access public
------------------------------------------------------*/

module.exports.registerUserCtrl = asyncHandler(async (req,res)=>{
    // validation
    const {error} = validateRegisterUser(req.body) ;
    if ( error ){
        return res.status(400).json({message : error.details[0].message})
    }
    // is user already exist
    let user = await User.findOne({email : req.body.email})
    if(user){
        return res.status(400).json({message:"user already exist"})
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    // new user and save it to Db
    user = new User({
        username : req.body.username,
        email : req.body.email,
        password : hashedPassword,
    })
    await user.save();

    // Creating New VerificationToken & save it to DB
    const verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
    })
    await verificationToken.save();

    //Making the Link
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

    //Putting the Link into html template
    const htmlTemplate = `
    <div>
        <p>Click on the link below to verify your email</p>
        <a href="${link}">Verify</a>
    </div>`;

    //Sending Email to the User
    await sendEmail(user.email,"Verify Your Email",htmlTemplate);

    // send a response to client 
    res.status(201).json({message:"We sent to you an email, please verify your email address"});
});


/**-----------------------------------------------------
*   @desc Login User 
*   @route /api/auth/login
*   @method POST
*   @access public
------------------------------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req,res) => {
    // 1. Validation
    const {error} = validateLoginUser(req.body) ;
    if ( error ){
        return res.status(400).json({message : error.details[0].message})
    }
    // 2. is user exist
    const user = await User.findOne({ email: req.body.email })
    if(!user){
        return res.status(400).json({message : "invalid email"})
    }

    // 3. Check if the user is blocked
    if (user.isBlocked) {
        return res.status(400).json({ message: "User is blocked" });
    }

    // 4. check the password
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password)
    if(!isPasswordMatch){
        return res.status(400).json({message : "invalid password"})
    }
    // 5. sending email ( verify account )
    if(!user.isAccountVerified) {
        let verificationToken = await VerificationToken.findOne({
            userId: user._id,
        });

        if(!verificationToken) {
            verificationToken = new VerificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            });
            await verificationToken.save();
        }
            const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

            const htmlTemplate = `
            <div>
                <p>Click on the link below to verify your email</p>
                <a href="${link}">Verify</a>
            </div>`;
            
            await sendEmail(user.email,"Verify Your Email",htmlTemplate);
        
        return res.status(400).json({message:"We sent to you an email, please verify your email address"});
    }

    // 6. generate token (jwt)
    const token = user.generateAuthToken()

    // 7. response to client 
    res.status(200).json({
        _id : user._id,
        isAdmin : user.isAdmin,
        profilePhoto: user.profilePhoto,
        token,
        username: user.username,
    });
});


/**-----------------------------------------------------
*   @desc Verify User Account
*   @route /api/auth/:userId/verify/:token
*   @method GET
*   @access public
------------------------------------------------------*/
module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.userId);
    if(!user) {
        return res.status(400).json({ message: "invalid link" });
    }

    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token,
    });

    if(!verificationToken) {
        return res.status(400).json({ message: "invalid link" });
    }

    user.isAccountVerified = true;
    await user.save();

    await verificationToken.deleteOne({ _id: verificationToken._id })

    res.status(200).json({ message: "Your account verified" });


});
