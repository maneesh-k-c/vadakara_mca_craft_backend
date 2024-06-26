const express = require('express');
const adminRouter = express.Router();
adminRouter.use(express.static('./public'))
const bcrypt = require('bcryptjs');
const loginData = require('../models/loginSchema');
const userData = require('../models/userSchema');
const studentData = require('../models/studentSchema');
const productData = require('../models/productSchema');
const orderData = require('../models/orderSchema');
const complaintData = require('../models/complaintSchema');

adminRouter.get('/', async (req, res) => {
    const users = await userData.find()
    const student = await studentData.find()
    const product = await productData.find()
    const order = await orderData.find({status:'pending'})
    res.render('dashboard',{users,student,product,order})
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
        if (users[0]) {
            const data = {}
            res.render('view-users', { data, users })
        } else {
            const data = {
                Message: 'No data found',
            }
            const users = []
            return res.render('view-turf', { users, data })
        }

    } catch (error) {

    }

})

adminRouter.get('/view-complaints', async (req, res) => {
    try {
        const users = await complaintData.aggregate([
            {
                '$lookup': {
                    'from': 'user_tbs',
                    'localField': 'login_id',
                    'foreignField': 'login_id',
                    'as': 'user'
                }
            },
            {
                '$lookup': {
                    'from': 'product_tbs',
                    'localField': 'product_id',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
            {
                '$unwind': {
                    'path': '$user'
                }
            },
            {
                '$unwind': {
                    'path': '$product'
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'name': {
                        '$first': '$user.name'
                    },
                    'complaint': {
                        '$first': '$complaint'
                    },
                    'title': {
                        '$first': '$title'
                    },
                    'product': {
                        '$first': '$product.product_name'
                    },
                    'image': {
                        '$first': '$product.image'
                    }
                }
            }
        ])
        if (users[0]) {
            const data = {}
            res.render('view-complaints', { data, users })
        } else {
            const data = {
                Message: 'No data found',
            }
            const users = []
            return res.render('view-complaints', { users, data })
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
            }, {
                '$match': {
                    'login.status': 2
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
        if (student[0]) {
            const data = {}
            res.render('view-students', { data, student })
        } else {
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
            }, {
                '$match': {
                    'login.status': { '$in': [0, 1] },

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
        if (student[0]) {
            const data = {}
            res.render('view-students', { data, student })
        } else {
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
            const deletedata = await loginData.deleteOne({ _id: id })
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

adminRouter.get('/view-works', async (req, res) => {
    try {
        const users = await productData.aggregate([
            {
                '$lookup': {
                    'from': 'student_tbs',
                    'localField': 'login_id',
                    'foreignField': 'login_id',
                    'as': 'student'
                }
            },
            {
                '$unwind': {
                    'path': '$student'
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'product_name': {
                        '$first': '$product_name'
                    },
                    'price': {
                        '$first': '$price'
                    },
                    'description': {
                        '$first': '$description'
                    },
                    'image': {
                        '$first': '$image'
                    },
                    'student_name': {
                        '$first': '$student.name'
                    },
                    'mobile': {
                        '$first': '$student.mobile'
                    }
                }
            }
        ])
        if (users[0]) {
            // return res.status(200).json({
            //     data:users
            // })
            const data = {}
            res.render('view-works', { data, users })
        } else {
            const data = {
                Message: 'No data found',
            }
            const users = []
            return res.render('view-works', { users, data })
        }

    } catch (error) {

    }

})



module.exports = adminRouter