const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};
const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
const userCtrl = {
  register: async (req, res) => {
    // res.json({msg:"Test Controllers"})
    try {
      const { name, email, password, isAdmin } = req.body;

      const user = await Users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "Email Already Registered" });
      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password should be at least 6 characters" });
      }
      if (name.length < 1) {
        return res
          .status(400)
          .json({ msg: "name should be atleast one character" });
      }

      //Password Encryption
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        email,
        password: passwordHash,
        role: isAdmin,
      });
      //save to mongodb
      newUser
        .save()
        .then(() => console.log("User saved Successfully"))
        .catch((err) => console.error("Error saving user:", err));

      //create jwt to authenticate
      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });
      console.log(accesstoken);
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });
      return res.json({ msg: "register success" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  refreshtoken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;

      if (!rf_token)
        return res.status(400).json({ msg: "Please Login or Register" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "Please Login or Register" });
        console.log(user);
        const accesstoken = createAccessToken({ id: user.id });
      });
      res.json({ rf_token });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User does not exist" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect Password" });
      }
      // console.log(user);
      // console.log(user.id);
      const accesstoken = createAccessToken({ id: user.id });
      const refreshtoken = createRefreshToken({ id: user.id });
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });
      res.json({ accesstoken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "Log out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) return res.status(400).json({ msg: "user Not found" });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = userCtrl;
// try{
//     const {name,email,password}=req.body;
//     const user=await Users.findOne({email});
//     if(user) return res.status(400).json({msg:"Email Already Registered"})
//     if(password.length<6){
//         return res.status(400).json({msg:"Password should be atleast 6 characters"})
//     }
//     return res.json({msg:"Registered Successfully"})
// }
// catch(err){
//     return res.status(500).json({msg:err.message});
// }
