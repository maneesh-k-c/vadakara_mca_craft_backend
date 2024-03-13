const express = require('express');
const userRouter = express.Router();
const productData = require('../models/productSchema');

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



module.exports = userRouter