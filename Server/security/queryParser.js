import qs from "qs";

const sanitizeQuery = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  const cleanedObj = {};
  for (const k in obj) {
    if (["__proto__", "constructor", "prototype"].includes(k)) continue;
    cleanedObj[k] = sanitizeQuery(obj[k]);
  }
  return cleanedObj;
};

export const queryParser = (req, res, next) => {
  try {
    if (req.url.includes("?")) {
      const [path, queryString] = req.url.split("?");

      // Allow reasonable query string lengths
      if (queryString.length > 8192) {
        return res
          .status(400)
          .json({ error: "Query string too long" });
      }

      try {
        // Parse query string using qs with safe options
        // Don't decode the entire string at once - let qs handle individual parameters
        const parsedQuery = qs.parse(queryString, {
          allowPrototypes: false,
          depth: 5,
          parameterLimit: 100,
          ignoreQueryPrefix: true,
          delimiter: /[&;]/, // Support both & and ; as delimiters
        });

        req.query = sanitizeQuery(parsedQuery);
      } catch (err) {
        // If query parsing fails, let Express handle the default parsing
        console.warn("[QueryParser] Parse warning:", err.message);
      }
    }

    next();
  } catch (e) {
    console.error("[QueryParser Error]:", e.message);
    // Don't reject with 400, let Express handle it
    next();
  }
};
