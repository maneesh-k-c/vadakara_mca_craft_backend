const express = require('express');
const userRouter = express.Router();
const productData = require('../models/productSchema');
const userData = require('../models/userSchema');
const orderData = require('../models/orderSchema');
const { default: mongoose } = require('mongoose');
const complaintData = require('../models/complaintSchema');
const feedbackData = require('../models/feedbackSchema');

userRouter.get('/view-product-highlights/', async (req, res, next) => {
    try {
        const Data = await productData.find({ highlight_status: 1 });
        if (Data[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: Data,
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'No data found',
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

userRouter.post('/update-user-profile/:id', async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await userData.findOne({ login_id: id });
        let reg = {
            name: req.body.name ? req.body.name : oldData.name,
            mobile: req.body.mobile ? req.body.mobile : oldData.mobile,
            address: req.body.address ? req.body.address : oldData.address,
        };

        console.log(reg);
        const update = await userData.updateOne({ login_id: id }, { $set: reg })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Profile updated',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating profile',
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            Message: 'Something went wrong!',
        });
    }
})

userRouter.post('/add-to-cart/:login_id/:product_id', async (req, res) => {
    try {
        const login_id = req.params.login_id;
        const product_id = req.params.product_id;

        const existingProduct = await orderData.findOne({
            product_id: product_id,
            login_id: login_id,
            status: "pending"
        });
        console.log(existingProduct);
        const product_price = await productData.findOne({ _id: product_id })
        if (existingProduct) {
            console.log("hi", product_price);
            const quantity = existingProduct.quantity;

            const updatedQuantity = Number(quantity) + 1;
            console.log(updatedQuantity);
            const sub = updatedQuantity * Number(product_price.price)
            console.log(sub);
            const updatedData = await orderData.updateOne(
                { _id: existingProduct._id },
                { $set: { quantity: updatedQuantity, total: sub } }
            );

            return res.status(200).json({
                success: true,
                error: false,
                data: updatedData,
                message: 'incremented existing product quantity',
            });
        } else {
            const orderDatas = {
                login_id: login_id,
                product_id: product_id,
                total: req.body.price,
            };
            const Data = await orderData(orderDatas).save();
            if (Data) {
                return res.status(200).json({
                    Success: true,
                    Error: false,
                    data: Data,
                    Message: 'Product added to cart successfully',
                });
            } else {
                return res.status(400).json({
                    Success: false,
                    Error: true,
                    Message: 'Product adding failed',
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            Success: false,
            Error: true,
            Message: 'Internal Server error',
            ErrorMessage: error.message,
        });
    }
});

userRouter.post('/update-cart-quantity/:_id', async (req, res) => {
    try {
        const id = req.params._id;
        const quantity = req.body.quantity;
        const existingProduct = await orderData.findOne({
            _id: id,
        });
        const pro = await productData.findOne({ _id: existingProduct.product_id })
        const sub = Number(quantity) * Number(pro.price)
        console.log(sub);
        const updatedData = await orderData.updateOne(
            { _id: id },

            { $set: { quantity: quantity, total: sub } }
        );

        if (updatedData) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: updatedData,
                Message: 'cart updated successfully',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Cart update failed',
            });
        }
    } catch (error) {
        return res.status(500).json({
            Success: false,
            Error: true,
            Message: 'Internal Server error',
            ErrorMessage: error.message,
        });
    }
}
);

userRouter.get('/view-cart/:id', async (req, res) => {
    try {
        const product = await orderData.aggregate([
            {
                '$lookup': {
                    'from': 'product_tbs',
                    'localField': 'product_id',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
            {
                '$unwind': '$product'
            },
            {
                '$match': {
                    'login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$match': {
                    'status': 'pending'
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'image': {
                        '$first': {
                            '$cond': {
                                if: { '$ne': ['$product.image', null] },
                                then: '$product.image',
                                else: 'default_image_url',
                            },
                        },
                    },
                    'quantity': { '$first': '$quantity' },
                    'total': { '$first': '$total' },
                    'product_name': { '$first': '$product.product_name' },
                    'description': { '$first': '$product.description' },
                    'product_id': { '$first': '$product_id' },
                    'status': { '$first': '$status' },
                }
            }
        ])
        console.log(product);
        if (product[0]) {
            var total = 0
            product.forEach((item) => {
                total += Number(item.total);
            });
            return res.status(200).json({
                totalAmount: total,
                Success: true,
                Error: false,
                data: product,
            });

        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

userRouter.get('/delete-cart/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const deleteData = await orderData.deleteOne({ _id: id });
        if (deleteData.deletedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Data removed from cart',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Failed to delete',
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

userRouter.post('/order-product/:login_id', async (req, res) => {
    try {
        const login_id = req.params.login_id;

        const existingProduct = await orderData.find({
            status: 'pending',
            login_id: login_id,
        });
        console.log('existingProduct',existingProduct);
        const datas = [];
        if (existingProduct[0]) {
            for (let i = 0; i < existingProduct.length; i++) {
                const old_id = existingProduct[i]._id
                const product_id = existingProduct[i].product_id
                const oldQuantity = await productData.findOne({ _id: product_id })
                const newquantity = Number(oldQuantity.quantity) - Number(existingProduct[i].quantity)
                console.log('newquantity',newquantity);
                const updateProduct = await productData.updateOne({ _id: old_id }, { quantity: newquantity })
                const update = await orderData.updateOne({ _id: old_id }, { status: "orderPlaced" })
                
            }
           
                return res.status(200).json({
                    Success: true,
                    Error: false,
                    Message: 'Order placed',
                });
            
        }
        else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Failed to order',

            });
        }
    } catch (error) {
        return res.status(500).json({
            Success: false,
            Error: true,
            Message: 'Internal Server error',
            ErrorMessage: error.message,
        });
    }
});

userRouter.get('/view-profile/:id', async (req, res) => {
    try {
        const user = await userData.aggregate([
            {
                '$lookup': {
                    'from': 'login_tbs',
                    'localField': 'login_id',
                    'foreignField': '_id',
                    'as': 'result'
                }
            }, {
                '$unwind': {
                    'path': '$result'
                }
            }, {
                '$match': {
                    'login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'login_id': { '$first': '$login_id' },
                    'name': { '$first': '$name' },
                    'address': { '$first': '$address' },
                    'mobile': { '$first': '$mobile' },
                    'email': { '$first': '$result.email' },
                }
            }
        ]);
        if (user) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: user
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

userRouter.get('/view-cart-confirmed/:id', async (req, res) => {
    try {
        const product = await orderData.aggregate([
            {
                '$lookup': {
                    'from': 'product_tbs',
                    'localField': 'product_id',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
            {
                '$unwind': '$product'
            },
            {
                '$match': {
                    'login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$match': {
                    'status': 'Confirmed'
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'image': {
                        '$first': {
                            '$cond': {
                                if: { '$ne': ['$product.image', null] },
                                then: '$product.image',
                                else: 'default_image_url',
                            },
                        },
                    },
                    'quantity': { '$first': '$quantity' },
                    'total': { '$first': '$total' },
                    'product_name': { '$first': '$product.product_name' },
                    'description': { '$first': '$product.description' },
                    'product_id': { '$first': '$product_id' },
                    'status': { '$first': '$status' },
                }
            }
        ])
        console.log(product);
        if (product[0]) {
            var total = 0
            product.forEach((item) => {
                total += Number(item.total);
            });
            return res.status(200).json({
                totalAmount: total,
                Success: true,
                Error: false,
                data: product,
            });

        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

userRouter.post('/add-complaint', async (req, res, next) => {
    try {

        let details = {
            login_id: req.body.login_id,
            product_id: req.body.product_id,
            complaint: req.body.complaint,
            title: req.body.title,
            reply: '',
            status: 0
        };
        const result2 = await complaintData(details).save();

        if (result2) {
            return res.json({
                Success: true,
                Error: false,
                data: result2,
                Message: 'Complaint added',
            });
        } else {
            return res.json({
                Success: false,
                Error: true,
                Message: 'Failed to add complaint',
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

userRouter.get('/view-complaint/:id', async (req, res) => {
    try {
        const booking = await complaintData.aggregate([
            {
                '$lookup': {
                    'from': 'product_tbs',
                    'localField': 'product_id',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
            {
                '$lookup': {
                    'from': 'user_tbs',
                    'localField': 'login_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': {
                    'path': '$product'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$match': {
                    'product.login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'name': { '$first': '$user.name' },
                    'title': { '$first': '$title' },
                    'complaint': { '$first': '$complaint' },
                    'reply': { '$first': '$reply' },
                }
            }
        ]);
        if (booking) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: booking
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

// userRouter.post('//:_id', async (req, res) => {
//     try {
//         const id = req.params._id;
//         const quantity = req.body.quantity;
//         const existingProduct = await orderData.findOne({
//             _id: id,
//         });
//         const pro = await productData.findOne({ _id: existingProduct.product_id })
//         const sub = Number(quantity) * Number(pro.price)
//         console.log(sub);
//         const updatedData = await orderData.updateOne(
//             { _id: id },

//             { $set: { quantity: quantity, total: sub } }
//         );

//         if (updatedData) {
//             return res.status(200).json({
//                 Success: true,
//                 Error: false,
//                 data: updatedData,
//                 Message: 'cart updated successfully',
//             });
//         } else {
//             return res.status(400).json({
//                 Success: false,
//                 Error: true,
//                 Message: 'Cart update failed',
//             });
//         }
//     } catch (error) {
//         return res.status(500).json({
//             Success: false,
//             Error: true,
//             Message: 'Internal Server error',
//             ErrorMessage: error.message,
//         });
//     }
// }
// );

userRouter.post('/add-feedback', async (req, res, next) => {
    try {

        let details = {
            login_id: req.body.login_id,
            product_id: req.body.product_id,
            feedback: req.body.feedback,
            reply: '',
        };
        const result2 = await feedbackData(details).save();

        if (result2) {
            return res.json({
                Success: true,
                Error: false,
                data: result2,
                Message: 'Feedback added',
            });
        } else {
            return res.json({
                Success: false,
                Error: true,
                Message: 'Failed to add feedback',
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

userRouter.get('/view-feedback/:id', async (req, res) => {
    try {
        const feedback = await feedbackData.aggregate([
            {
                '$lookup': {
                    'from': 'product_tbs',
                    'localField': 'product_id',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
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
                    'from': 'student_tbs',
                    'localField': 'product.login_id',
                    'foreignField': 'login_id',
                    'as': 'student'
                }
            },  {
                '$unwind': {
                    'path': '$product'
                }
            },{
                '$unwind': {
                    'path': '$student'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$match': {
                    'product.login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'name': { '$first': '$user.name' },
                    'feedback': { '$first': '$feedback' },
                }
            }
        ]);
        if (feedback) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: feedback
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})


userRouter.post('/reply-complaint', async (req, res) => {
    try {
        const id = req.body._id
       
        const update = await complaintData.updateOne({ _id: id }, { $set: {reply:req.body.reply} })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Reply added',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while adding reply',
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            Message: 'Something went wrong!',
        });
    }
})

userRouter.get('/view-complaint-user/:id', async (req, res) => {
    try {
        const booking = await complaintData.aggregate([
            {
                '$lookup': {
                    'from': 'product_tbs',
                    'localField': 'product_id',
                    'foreignField': '_id',
                    'as': 'product'
                }
            },
            {
                '$lookup': {
                    'from': 'user_tbs',
                    'localField': 'login_id',
                    'foreignField': 'login_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': {
                    'path': '$product'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, 
            {
                '$match': {
                    'login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'name': { '$first': '$user.name' },
                    'title': { '$first': '$title' },
                    'complaint': { '$first': '$complaint' },
                    'reply': { '$first': '$reply' },
                }
            }
        ]);
        if (booking) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: booking
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})





module.exports = userRouter