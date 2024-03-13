const express = require('express');
const LoginRouter = express.Router();
const bcrypt = require('bcryptjs');
const loginData = require('../models/loginSchema');
require('dotenv').config();

LoginRouter.post('/', async (req, res, next) => {
    try {

        if (req.body.email && req.body.password) {

            const oldUser = await loginData.findOne({
                email: req.body.email,
            });
            if (!oldUser) {
                return res.status(400).json({
                    Success: false,
                    Error: true,
                    Message: 'You have to Register First',
                });
            }

            if (oldUser.status==0) {
                return res.json({
                    Success: false,
                    Error: true,
                    Message: 'Waiting for admins approval',
                });
            }

            const isPasswordCorrect = await bcrypt.compare(
                req.body.password,
                oldUser.password
            );
            if (!isPasswordCorrect) {
                return res.json({
                    Success: false,
                    Error: true,
                    Message: 'Password Incorrect',
                });
            }

            return res.status(200).json({
                success: true,
                error: false,
                loginId: oldUser._id,
                email: oldUser.email,
                userRole: oldUser.role,
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'All field are required',
            });
        }
    } catch (error) {
        return res.json({
            Success: false,
            Error: true,
            Message: 'Something went wrong',
        });
    }
});

module.exports = LoginRouter

