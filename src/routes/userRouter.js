const express = require('express');
const userRouter = express.Router();
const productData = require('../models/productSchema');
const userData = require('../models/userSchema');
const orderData = require('../models/orderSchema');

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
        });
        const product_price = await productData.findOne({ product_id: product_id})
        if (existingProduct) {
            const quantity = existingProduct.quantity;
            const updatedQuantity = quantity + 1;
            const sub = updatedQuantity * product_price.price
            console.log(sub);
            const updatedData = await cartData.updateOne(
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


module.exports = userRouter