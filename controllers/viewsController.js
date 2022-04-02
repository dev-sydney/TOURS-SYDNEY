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

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  //TODO:
  //1) Get the data for the requested tour (including the reviews & guides)
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    fields: 'reviews rating user',
  });

  //2) Build the template

  //3)Render the template using the data from 1)
  res.status(200).render('tour', { title: 'The Forest Hiker Tour', tour });
});
