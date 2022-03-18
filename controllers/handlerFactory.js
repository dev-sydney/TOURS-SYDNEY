const catchAsyncErrors = require('./../utils/catchAsyncError');
const AppError = require('./../utils/appErrors');

exports.deleteOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      return next(
        new AppError('Could not find any document with that ID', 404)
      );

    res.status(204).json({
      data: null,
    });
  });

//CREATING A DOC
exports.createOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
//READING A DOC
exports.getOne = (Model, popOption) =>
  catchAsyncErrors(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);

    const doc = await query;
    if (!doc) {
      return next(
        new AppError('Could not find any document with that ID...', 400)
      );
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .fieldLimit()
      .paginate();

    const docs = await features.query;
    //TODO:
    //implement field limiting
    //implement pagination

    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: docs,
    });
  });

//UPDATING THE DOC
exports.updateOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(
        new AppError('Could not find any document with that ID', 404)
      );

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
