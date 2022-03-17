class APIFeatures {
  /**
   * This class contains methods that will manipulate our query Object
   * @param {Object} query  this is the mongoose query object (Model.find())
   * @param {Object} queryString this is the req object from the client which will later be turned into a string
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'limit', 'page', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte\lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortByStr = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortByStr);
    } else {
      this.query = this.query.sort('CreatedAt');
    }
    return this;
  }

  fieldLimit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page ? +this.queryString.page : 1;
    const limitValue = this.queryString.limit ? +this.queryString.limit : 100;
    const skipValue = (page - 1) * limitValue;

    this.query = this.query.skip(skipValue).limit(limitValue);
    return this;
  }
}

module.exports = APIFeatures;
