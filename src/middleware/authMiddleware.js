const admin = require("../config/firebase");
const responseHandler = require("../utils/responseHandler");

const authenticate = async (request, h) => {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return responseHandler.error(h, "Authorization token is required", 401);
  }

  const token = authorization.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    request.user = decodedToken; // Menyimpan data pengguna di request
    return h.continue;
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return responseHandler.error(h, "Invalid or expired token", 401);
  }
};

module.exports = { authenticate };
