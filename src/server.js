require("dotenv").config();
const Hapi = require("@hapi/hapi");
const authRoutes = require("./routes/authRoutes");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: "localhost",
  });

  // Register Routes
  server.route(authRoutes);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
