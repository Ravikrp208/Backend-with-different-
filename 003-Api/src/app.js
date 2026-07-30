const express = require("express")

const app = express ();

app.use(express.json)

const notes = [
    {
        "title":"test user 1",
        "description": "test description"
    }
]

module.export = app
