const success = (h, message, data) => {
  return h
    .response({
      status: "success",
      message,
      data,
    })
    .code(200);
};

const error = (h, message, code = 500) => {
  return h
    .response({
      status: "error",
      message,
    })
    .code(code);
};

module.exports = { success, error };
