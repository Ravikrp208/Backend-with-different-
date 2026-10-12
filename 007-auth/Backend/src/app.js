const express = require("express"); /* express ko import krna. */

const  app = express(); /* server create ho jata hai. */    

app.use(express.json()); /* server ko config krna ki jo bhi data aayega wo json format me hoga. */


module.exports = app;