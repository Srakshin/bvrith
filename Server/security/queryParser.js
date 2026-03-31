// Skip custom query parsing - Express has solid built-in parsing
// OAuth callbacks and other APIs expect standard query string handling
export const queryParser = (req, res, next) => {
  // Simply pass through - Express will handle query parsing natively
  // This avoids issues with special characters in OAuth parameters (like state values)
  next();
};
