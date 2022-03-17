const fs = require('fs');

const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('../models/toursModel');
const res = require('express/lib/response');

//HOOKING THE .env file(env variables) to this file
dotenv.config({ path: './config.env' });

//READING THE DATA
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8')
);

//CREATING OUR DATABASE CONNECTION STRING
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//CONNECTING OUR DB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB Connection Successful🚀🚀'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Successfully Loaded👍🏽');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Sucessfully deleted 👍🏽');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
