const express = require('express');
const studentRouter = express.Router();
const productData = require('../models/productSchema');


studentRouter.post('/add-product', async (req, res, next) => {
try {
    
    let product_data = {
        login_id: req.body.login_id,
        product_name: req.body.product_name,
        price: req.body.price,
        description: req.body.description,
        image: req.files ? req.files.map((file) => file.path) : null,
        quantity: req.body.quantity,
        highlight_status:0,
        status:0
    };
    const result = await productData(product_data).save();
    if (result) {
    return res.json({
        Success: true,
        Error: false,
        data: result,
        Message: 'Product added',
    });
    } else {
    return res.json({
        Success: false,
        Error: true,
        Message: 'Failed to add',
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

studentRouter.get('/view-all-products/', async (req, res, next) => {
try {
    const Data = await productData.find();
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

studentRouter.get('/view-single-product/:id', async (req, res, next) => {
try {
    const Data = await productData.findOne({ _id: req.params.id });
    if (Data) {
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

studentRouter.get('/view-all-product-added-by-student/:login_id', async (req, res, next) => {
try {
    const Data = await productData.find({ login_id: req.params.login_id });
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

studentRouter.get('/delete-product/:id', async (req, res, next) => {
try {
    const id= req.params.id
    const deleteData = await productData.deleteOne({ _id: id });
    if (deleteData.deletedCount==1) {
    return res.status(200).json({
        Success: true,
        Error: false,
        Message: 'Product deleted',
    });
    }else{
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

studentRouter.post('/update-product/:product_id', async (req, res, next) => {
    try {
      const objectId = req.params.product_id;
      const previousData = await productData.findOne({
        _id: objectId,
      });
      var updateData = {
        login_id: previousData.login_id,
        product_name: req.body.product_name ? req.body.product_name : previousData.product_name,  
        price: req.body.price ? req.body.price : previousData.price,  
        description: req.body.description ? req.body.description : previousData.description,  
        quantity: req.body.quantity ? req.body.quantity : previousData.quantity,  
        image: req.files && req.files.length > 0
        ? req.files.map((file) => file.path)
        : previousData.image,
      };
      const Data = await productData.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
  
      if (Data.modifiedCount==1) {
        return res.status(200).json({
          Success: true,
          Error: false,
          data: Data,
          Message: 'Product data updated successfully',
        });
      } else {
        return res.status(400).json({
          Success: false,
          Error: true,
          Message: 'Failed while updating product data',
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

studentRouter.get('/add-highlights/:product_id', async (req, res, next) => {
    try {
      const objectId = req.params.product_id;
      
      const Data = await productData.updateOne(
        { _id: objectId },
        { $set: {highlight_status:1} }
      );
  
      if (Data.modifiedCount==1) {
        return res.status(200).json({
          Success: true,
          Error: false,
          data: Data,
          Message: 'Product added to highlights',
        });
      } else {
        return res.status(400).json({
          Success: false,
          Error: true,
          Message: 'Failed while adding to highlights',
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

studentRouter.get('/remove-highlights/:product_id', async (req, res, next) => {
    try {
      const objectId = req.params.product_id;
      
      const Data = await productData.updateOne(
        { _id: objectId },
        { $set: {highlight_status:0} }
      );
  
      if (Data.modifiedCount==1) {
        return res.status(200).json({
          Success: true,
          Error: false,
          data: Data,
          Message: 'Product removed from highlights',
        });
      } else {
        return res.status(400).json({
          Success: false,
          Error: true,
          Message: 'Failed while removing from highlights',
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

module.exports = studentRouter