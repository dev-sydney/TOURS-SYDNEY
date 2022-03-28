const Tour = require('./../models/toursModel');
const catchAsyncErrors = require('./../utils/catchAsyncError');

exports.getOverview = catchAsyncErrors(async (req, res, next) => {
  //TODO:
  //.1 Get The Tour Data From the Collection
  const tours = await Tour.find();
  //2. Build out the template

  //3.Render out the template using the tour data from 1.
  res.status(200).render('overview', { title: 'All The Tours', tours });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', { title: 'The Forest Hiker Tour' });
};
