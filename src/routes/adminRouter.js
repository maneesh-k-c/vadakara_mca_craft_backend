const express = require('express');
const adminRouter = express.Router();
adminRouter.use(express.static('./public'))
const bcrypt = require('bcryptjs');
const loginData = require('../models/loginSchema');
const userData = require('../models/userSchema');
const studentData = require('../models/studentSchema');

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

adminRouter.get('/view-rejected-students', async (req, res) => {
    try {
        const student = await studentData.aggregate([
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
            },{
                '$match':{
                    'login.status':2
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
          if(student[0]){
            const data = {}
            res.render('view-students',{data,student})
          }else{
            const data = {
                Message: 'No data found',
            }
            const student = []
            return res.render('view-students', { student, data })
          }
          
    } catch (error) {
        
    }
    
})
adminRouter.get('/view-students', async (req, res) => {
    try {
        const student = await studentData.aggregate([
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
            },{
                '$match':{
                    'login.status':{ '$in': [0, 1] }, 
                    
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
          if(student[0]){
            const data = {}
            res.render('view-students',{data,student})
          }else{
            const data = {
                Message: 'No data found',
            }
            const student = []
            return res.render('view-students', { student, data })
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

adminRouter.get('/delete-student/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const deletedata = await studentData.deleteOne({ login_id: id })
        if (deletedata.deletedCount == 1) {
            const deletedata = await loginData.deleteOne({_id: id })
            return res.redirect('/admin/view-students')
        } else {
            return res.redirect('/admin/view-students')
        }
    } catch (error) {
        return res.redirect('/admin/view-students')
    }
})

adminRouter.get('/update-student/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const update = await loginData.updateOne({ _id: id }, { $set: { status: 1 } })
        if (update.modifiedCount == 1) {
            return res.redirect('/admin/view-students')
        } else {
            return res.redirect('/admin/view-students')
        }
    } catch (error) {
        return res.redirect('/admin/view-students')
    }
})

adminRouter.get('/restore-student/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const update = await loginData.updateOne({ _id: id }, { $set: { status: 1 } })
        if (update.modifiedCount == 1) {
            return res.redirect('/admin/view-students')
        } else {
            return res.redirect('/admin/view-students')
        }
    } catch (error) {
        return res.redirect('/admin/view-students')
    }
})

adminRouter.get('/reject-student/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const update = await loginData.updateOne({ _id: id }, { $set: { status: 2 } })
        if (update.modifiedCount == 1) {
            return res.redirect('/admin/view-rejected-students')
        } else {
            return res.redirect('/admin/view-rejected-students')
        }
    } catch (error) {
        return res.redirect('/admin/view-rejected-students')
    }
})



module.exports = adminRouter