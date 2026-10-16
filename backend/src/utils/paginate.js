
export const getPaginationOptions = (query, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || String(defaultLimit), 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};


export const getPaginationMetadata = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

export default { getPaginationOptions, getPaginationMetadata };
