const express = require("express"); /* express ko import krna. */
const authRouter = require("./routers/auth.routes.js"); /* auth router ko import krna. */
const cookiesParser = require("cookie-parser"); /* cookie parser ko import krna. */

const app = express(); /* server create ho jata hai. */

app.use(
  express.json(),
); /* server ko config krna ki jo bhi data aayega wo json format me hoga. */
app.use(cookiesParser()); /* cookie parser ko use krna. */

app.use("/api/auth", authRouter); /* auth router ko use krna. */

module.exports = app;
