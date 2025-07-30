const express = require('express');
const { googleLogin } = require('../controllers/authController.js');

const Router= express.Router();

Router.get('/google',googleLogin)
module.exports = Router;