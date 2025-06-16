class APIfeatures {
  constructor(query, reqQueryString) {
    this.query = query;
    this.reqQueryString = reqQueryString;
  }
  filter() {
    const queryObj = { ...this.reqQueryString };

    const rejectFields = ['sort', 'page', 'limit', 'fields'];
    rejectFields.forEach((element) => delete queryObj[element]);
    let queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(
      /\b(gt|lt|gte|lte)\b/g,
      (value) => `$${value}`,
    );

    this.query.find(JSON.parse(queryString));
    return this;
  }
  sorting() {
    //SORTING
    //console.log('abba');
    if (this.reqQueryString.sort) {
      //console.log('ghhh');
      let sortString = this.reqQueryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortString);
    } else {
      //console.log('nee');
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limiting() {
    //Limiting the fields

    if (this.reqQueryString.fields) {
      let fieldString = this.reqQueryString.fields.split(',').join(' ');
      //console.log(fieldString);
      this.query = this.query.select(fieldString);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    //PAGINATION
    const page = this.reqQueryString.page * 1 || 1;
    const limit = this.reqQueryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIfeatures;
