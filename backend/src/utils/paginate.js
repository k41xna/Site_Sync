/**
 * Computes skip and limit pagination options from request query.
 * @param {Object} query - Express request query object (req.query)
 * @param {number} [defaultLimit=10] - Fallback limit
 * @returns {Object} { page, limit, skip }
 */
export const getPaginationOptions = (query, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || String(defaultLimit), 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Formats a paginated response metadata block.
 * @param {number} totalItems - Total count of records matching query
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} { totalItems, totalPages, currentPage, limit }
 */
export const getPaginationMetadata = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit
  };
};

export default { getPaginationOptions, getPaginationMetadata };
