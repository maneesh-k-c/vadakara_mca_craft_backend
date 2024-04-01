const express = require('express');
const adminRouter = express.Router();
adminRouter.use(express.static('./public'))
const bcrypt = require('bcryptjs');
const loginData = require('../models/loginSchema');
const userData = require('../models/userSchema');

adminRouter.get('/', async (req, res) => {
    res.render('dashboard')
})

adminRouter.get('/logout', async (req, res) => {
    res.redirect('/')
})

adminRouter.get('/view-users', async (req, res) => {
    try {
        const users = await userData.aggregate([
            {
              '$lookup': {
                'from': 'login_tbs', 
                'localField': 'login_id', 
                'foreignField': '_id', 
                'as': 'login'
              }
            },
            {
                '$unwind': {
                    'path': '$login'
                }
            },
            {
                '$group': {
                    '_id': '$_id', 
                    'name': {
                        '$first': '$name'
                    }, 
                    'mobile': {
                        '$first': '$mobile'
                    }, 
                    'address': {
                        '$first': '$address'
                    }, 
                    'status': {
                        '$first': '$login.status'
                    }, 
                    'login_id': {
                        '$first': '$login._id'
                    },
                    'email': {
                        '$first': '$login.email'
                    }
                }
            }
          ])
          if(users[0]){
            const data = {}
            res.render('view-users',{data,users})
          }else{
            const data = {
                Message: 'No data found',
            }
            const users = []
            return res.render('view-turf', { users, data })
          }
          
    } catch (error) {
        
    }
    
})

adminRouter.post('/login', async (req, res, next) => {
    try {
       
        if (req.body.email && req.body.password) {
            const oldUser = await loginData.findOne({
                email: req.body.email,
            });
            console.log(oldUser);
            if (!oldUser) {
                return res.render('login.ejs', { Message: 'Email Incorrect' });
            }
            const isPasswordCorrect = await bcrypt.compare(
                req.body.password,
                oldUser.password
            );
            console.log(isPasswordCorrect);
            if (!isPasswordCorrect) {
                return res.render('login.ejs', { Message: 'Password Incorrect' });
            }
            return res.redirect('/admin/')
        } else {
            return res.render('login.ejs', { Message: 'All field are required' });
        }
    } catch (error) {
        return res.render('login.ejs', { Message: 'Something went wrong' });

    }
});



module.exports = adminRouter