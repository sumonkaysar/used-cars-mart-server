const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion } = require('mongodb')
require("dotenv").config()

const port = process.env.PORT || 5000
const app = express()

// middle ware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zuoxzfe.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })


app.get("/", (req, res) => {
  res.send("Used Cars Mart server is running")
})

app.listen(port, () => console.log("Server is running on port: ", port))