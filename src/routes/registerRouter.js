const express = require('express');
const registerRouter = express.Router();
const bcrypt = require('bcryptjs');
const loginData = require('../models/loginSchema');
const userData = require('../models/userSchema');
const studentData = require('../models/studentSchema');


//user role 1
//student role 2

registerRouter.post('/user', async (req, res, next) => {
try {
    const oldEmail = await loginData.findOne({ email: req.body.email });
    if (oldEmail) {
    return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Email already exist, Please Log In',
    });
    }
    const oldPhone = await userData.findOne({ mobile: req.body.mobile });
    if (oldPhone) {
    return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Mobile number already exist',
    });
    }
    
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    let log = {
    email: req.body.email,
    password: hashedPassword,
    role: 1,
    status:1
    };
    const result = await loginData(log).save();
    console.log(result);
    let reg = {
    login_id: result._id,
    name: req.body.name,
    mobile: req.body.mobile,
    address: req.body.address
    };
    const result2 = await userData(reg).save();

    if (result2) {
    return res.json({
        Success: true,
        Error: false,
        data: result2,
        Message: 'Registration Successful',
    });
    } else {
    return res.json({
        Success: false,
        Error: true,
        Message: 'Registration Failed',
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


registerRouter.post('/student', async (req, res, next) => {
try {
    const oldEmail = await loginData.findOne({ email: req.body.email });
    if (oldEmail) {
    return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Email already exist, Please Log In',
    });
    }
    const oldPhone = await userData.findOne({ mobile: req.body.mobile });
    if (oldPhone) {
    return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Mobile number already exist',
    });
    }
    
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    let log = {
    email: req.body.email,
    password: hashedPassword,
    role: 2,
    status:0
    };
    const result = await loginData(log).save();
    console.log(result);
    let reg = {
    login_id: result._id,
    name: req.body.name,
    mobile: req.body.mobile,
    address: req.body.address,
    academic_year: req.body.academic_year,
    course_name: req.body.course_name,
    stream: req.body.stream,

    };
    const result2 = await studentData(reg).save();

    if (result2) {
    return res.json({
        Success: true,
        Error: false,
        data: result2,
        Message: 'Registration Successful',
    });
    } else {
    return res.json({
        Success: false,
        Error: true,
        Message: 'Registration Failed',
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




module.exports = registerRouter