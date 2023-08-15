const { extend } = Cypress._; // _ using lodash built-in library;

// This function is expected to initialize request options with proper token
exports.requestOptions = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: '',
    },
  };
  return extend(defaultOptions, options);
};
