const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./models/Product');
  await Product.deleteMany({});
  console.log('✅ All products deleted');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit();
});