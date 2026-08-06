class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.filterConditions = {};
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'search',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne|in|nin)\b/g,
      (match) => `$${match}`
    );

    const parsed = JSON.parse(queryStr);
    this.filterConditions = { ...this.filterConditions, ...parsed };
    this.query = this.query.find(parsed);
    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const escapedSearch = this.queryString.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const searchCondition = {
        $or: fields.map((field) => ({
          [field]: {
            $regex: escapedSearch,
            $options: 'i',
          },
        })),
      };

      this.filterConditions = {
        ...this.filterConditions,
        ...searchCondition,
      };

      this.query = this.query.find(searchCondition);
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    this.page = Math.max(1, Number(this.queryString.page) || 1);
    this.limit = Math.min(
      100,
      Math.max(1, Number(this.queryString.limit) || 10)
    );

    const skip = (this.page - 1) * this.limit;

    this.query = this.query.skip(skip).limit(this.limit);

    return this;
  }
}
export default APIFeatures;
