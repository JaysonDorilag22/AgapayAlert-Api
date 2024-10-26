const MESSAGES = require('../constants/messages');

const paginate = async (model, query, page, pageSize, projection = '', sort = {}) => {
    if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
      throw new Error(MESSAGES.INVALID_PAGINATION_PARAMETERS);
    }
  
    const skip = (page - 1) * pageSize;
    const totalDocuments = await model.countDocuments(query);
    const documents = await model.find(query, projection)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean();
  
    return {
      page,
      pageSize,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / pageSize),
      documents,
    };
  };
  
  

module.exports = paginate;