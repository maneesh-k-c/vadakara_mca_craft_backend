const express = require('express');
const studentRouter = express.Router();
const productData = require('../models/productSchema');
const multer = require('multer');
const { default: mongoose } = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const orderData = require('../models/orderSchema');
const studentData = require('../models/studentSchema');
require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
const storageImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'craft',
  },
});
const uploadImage = multer({ storage: storageImage });

studentRouter.post('/add-product', uploadImage.array('image', 1), async (req, res, next) => {
  try {

    let product_data = {
      login_id: req.body.login_id,
      product_name: req.body.product_name,
      price: req.body.price,
      description: req.body.description,
      image: req.files ? req.files.map((file) => file.path) : null,
      quantity: req.body.quantity,
      highlight_status: 0,
      status: 0
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

studentRouter.get('/view-single-product/:id', async (req, res, next) => {
  try {
    const Data = await productData.findOne({ _id: req.params.id });
    if (Data) {
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

studentRouter.get('/view-all-product-added-by-student/:login_id', async (req, res, next) => {
  try {
    const Data = await productData.find({ login_id: req.params.login_id });
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

studentRouter.get('/delete-product/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const deleteData = await productData.deleteOne({ _id: id });
    if (deleteData.deletedCount == 1) {
      return res.status(200).json({
        Success: true,
        Error: false,
        Message: 'Product deleted',
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

studentRouter.post('/update-product/:product_id',uploadImage.array('image', 1), async (req, res, next) => {
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

    if (Data.modifiedCount == 1) {
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
      { $set: { highlight_status: 1 } }
    );

    if (Data.modifiedCount == 1) {
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
      { $set: { highlight_status: 0 } }
    );

    if (Data.modifiedCount == 1) {
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

studentRouter.get('/view-orders/:id', async (req, res) => {
  try {
    const order = await orderData.aggregate([
      {
        '$lookup': {
          'from': 'product_tbs',
          'localField': 'product_id',
          'foreignField': '_id',
          'as': 'product'
        }
      }, {
        '$lookup': {
          'from': 'user_tbs',
          'localField': 'login_id',
          'foreignField': 'login_id',
          'as': 'user'
        }
      },
      {
        '$unwind': '$product'
      },
      {
        '$unwind': '$user'
      },
      {
        '$match': {
          'product.login_id': new mongoose.Types.ObjectId(req.params.id)
        }
      },
      {
        '$match': {
          'status': 'orderPlaced'
        }
      },
      {
        '$group': {
          '_id': '$_id',
          'product_image': {
            '$first': {
              '$cond': {
                if: { '$ne': ['$product.image', null] },
                then: '$product.image',
                else: 'default_image_url',
              },
            },
          },
          'product_name': { '$first': '$product.product_name' },
          'quantity': { '$first': '$quantity' },
          'user_name': { '$first': '$user.name' },
          'user_mobile': { '$first': '$user.mobile' },
          'user_address': { '$first': '$user.address' },
          'total': { '$first': '$total' },
          'status': { '$first': '$status' },
        }
      }
    ])
    if (order[0]) {
      return res.status(200).json({
        Success: true,
        Error: false,
        data: order
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

studentRouter.post('/confirm-order/:_id', async (req, res) => {
  try {
    const id = req.params._id;
    const existingOrder = await orderData.findOne({
      _id: id,
    });
    const updatedData = await orderData.updateOne(
      { _id: id },

      { $set: { status: 'Confirmed' } }
    );

    if (updatedData.modifiedCount == 1) {
      const existingProduct = await productData.findOne({ _id: existingOrder.product_id })
      const newQuantity = Number(existingProduct.quantity) - Number(existingOrder.quantity)
      const updatedProductData = await productData.updateOne(
        { _id: existingOrder.product_id },

        { $set: { quantity: newQuantity } }
      );
      return res.status(200).json({
        Success: true,
        Error: false,
        data: updatedData,
        Message: 'Order Confirmed',
      });
    } else {
      return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'update failed',
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

studentRouter.get('/view-profile/:id', async (req, res) => {
  try {
      const user = await studentData.aggregate([
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
                  'academic_year': { '$first': '$academic_year' },
                  'course_name': { '$first': '$course_name' },
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

studentRouter.post('/update-profile', async (req, res) => {
  try {
      const id = req.body.id
      const oldData = await studentData.findOne({ login_id: id });
      let reg = {
          name: req.body.name ? req.body.name : oldData.name,
          mobile: req.body.mobile ? req.body.mobile : oldData.mobile,
          academic_year: req.body.academic_year ? req.body.academic_year : oldData.academic_year,
          course_name: req.body.course_name ? req.body.course_name : oldData.course_name,
          stream: req.body.stream ? req.body.stream : oldData.stream
      };
      
      console.log(reg);
      const update = await studentData.updateOne({ login_id: id }, { $set: reg })
      console.log(update);
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
module.exports = studentRouter