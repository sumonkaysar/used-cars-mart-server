const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const port = process.env.PORT || 5000
const app = express()

// middle ware
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Used Cars Mart server is running")
})

app.listen(port, () => console.log("Server is running on port: ", port))