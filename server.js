const express = require('express');
const app = express();
const mongoose = require('mongoose');
const adminRouter = require('./src/routes/adminRouter');
const registerRouter = require('./src/routes/registerRouter');


require('dotenv').config();
app.use(express.static('./public'))
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database Connected Successfully');
  })
  .catch((error) => {
    console.log('Database Error:', error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine','ejs')
app.set('views','./src/views')


app.get('/', (req, res) => {
  res.render('login',{Message: ''});
});

app.use('/admin',adminRouter)
app.use('/api/register',registerRouter)






app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
