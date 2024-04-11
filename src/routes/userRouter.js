const express = require('express');
const userRouter = express.Router();
const productData = require('../models/productSchema');
const userData = require('../models/userSchema');
const orderData = require('../models/orderSchema');
const { default: mongoose } = require('mongoose');

userRouter.get('/view-product-highlights/', async (req, res, next) => {
try {
    const Data = await productData.find({highlight_status:1});
    if (Data[0]) {
    return res.status(200).json({
        Success: true,
        Error: false,
        data: Data,
    });
    }else{
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
            status:"pending"
        });
        console.log(existingProduct);
        const product_price = await productData.findOne({ _id: product_id})
        if (existingProduct) {
            console.log("hi",product_price);
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
        const pro = await productData.findOne({_id:existingProduct.product_id})
        const sub = Number(quantity) * Number(pro.price)
        console.log(sub);
        const updatedData = await orderData.updateOne(
            { _id:id },

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
                totalAmount:total,
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

module.exports = userRouter