const UserModel = require('../models/userModel');
const { oauth2client } = require('../utils/googleConfig');
const axios = require('axios');
const jwt = require('jsonwebtoken');



const googleLogin = async (req, res) => {
  const code = req.query.code || req.body.code;
  console.log('[Google Login] Code:', code);

  try {
    const googleRes = await oauth2client.getToken(code);  // 👈 This line is failing
    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );

    const { email, name, picture } = userRes.data;

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({ name, email, image: picture });
    }

    const token = jwt.sign(
      { _id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TIMEOUT }
    );

    return res.status(200).json({ message: "User logged in", token, user });

  } catch (error) {
    console.error('[Google Login Error]:', error?.response?.data || error.message);
    return res.status(500).json({
      message: 'Google login failed',
      error: error.message,
      raw: error?.response?.data || null,
    });
  }
};


module.exports = {
    googleLogin
}