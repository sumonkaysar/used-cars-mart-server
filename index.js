const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require("dotenv").config()

const port = process.env.PORT || 5000
const app = express()

// middle ware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zuoxzfe.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

async function run() {
  try {
    const categoriesCollection = client.db('usedCarsMart').collection('categories')
    const carsCollection = client.db('usedCarsMart').collection('cars')
    const usersCollection = client.db('usedCarsMart').collection('users')
    const bookedCarsCollection = client.db('usedCarsMart').collection('bookedCars')

    app.get('/categories', async (req, res) => {
      const query = {}
      const categories = await categoriesCollection.find(query).toArray()

      res.send(categories)
    })

    app.get('/categories/:id', async (req, res) => {
      const { id } = req.params
      const { email } = req.query

      const carsQuery = { categoryId: id }
      const cars = await carsCollection.find(carsQuery).toArray()

      const bookingQuery = { buyerEmail: email }
      const booked = await bookedCarsCollection.find(bookingQuery).toArray()

      const bookedIds = booked.map(book => book.carId)
      const remainingCars = cars.filter(car => !bookedIds.includes(car._id.toString()))

      res.send(remainingCars)
    })

    app.get('/jwt', async (req, res) => {
      const {email} = req.query
      const query = {email}
      const user = await usersCollection.findOne(query)
      if (user) {
        const token = jwt.sign({email}, process.env.SECRET_TOKEN, {expiresIn: '1h'})
        return res.send({accessToken: token})
      }

      res.status(403).send({message: 'Forbidden Authorization'})
    })

    app.get('/cars', async (req, res) => {
      if (req.query.email) {
        const query = {sellerEmail: req.query.email}
      const cars = await carsCollection.find(query).toArray()

      res.send(cars)
      }else if (req.query.published) {
        const query = { published:  true, status: 'Available'}
        const publishedCars = await carsCollection.find(query).toArray()
  
        const bookingQuery = { }
        const booked = await bookedCarsCollection.find(bookingQuery).toArray()
  
        const bookedIds = booked.map(book => book.carId)
        const remainingCars = publishedCars.filter(car => !bookedIds.includes(car._id.toString()))
  
        res.send(remainingCars)
      }
    })

    app.post('/cars', async (req, res) => {
      const car = req.body
      const result = await carsCollection.insertOne(car)

      res.send(result)
    })

    app.patch('/cars/:id', async (req, res) => {
      const {id} = req.params
      const {published} = req.body
      const query = { _id: ObjectId(id) }
      const updatedDoc = {
        $set: { published }
      }
      const result = await carsCollection.updateOne(query, updatedDoc)

      res.send(result)
    })

    app.delete('/cars/:id', async (req, res) => {
      const {id} = req.params
      const query = { _id: ObjectId(id) }
      const result = await carsCollection.deleteOne(query)

      res.send(result)
    })

    app.get('/users/role', async (req, res) => {
      const query = { email: req.query.email }
      const user = await usersCollection.findOne(query)

      res.send({role: user?.role})
    })

    app.get('/users/verified', async (req, res) => {
      const query = { email: req.query.email }
      const user = await usersCollection.findOne(query)

      res.send({verified: user?.verified || false})
    })

    app.get('/users', async (req, res) => {
      const query = { role: req.query.role }
      const users = await usersCollection.find(query).toArray()

      res.send(users)
    })

    app.post('/users', async (req, res) => {
      const user = req.body
      const result = await usersCollection.insertOne(user)

      res.send(result)
    })

    app.patch('/users/:id', async (req, res) => {
      const {id} = req.params
      const {verified} = req.body
      
      const query = { _id: ObjectId(id) }
      const updatedDoc = {
        $set: {verified}
      }
      const result = await usersCollection.updateOne(query, updatedDoc)

      res.send(result)
    })

    app.delete('/users/:id', async (req, res) => {
      const {id} = req.params

      const query = { _id: ObjectId(id) }
      const result = await usersCollection.deleteOne(query)

      res.send(result)
    })

    app.post('/bookCar', async (req, res) => {
      const booking = req.body
      const query = { carId: booking.carId, buyerEmail: booking.buyerEmail }
      const bookedCar = await bookedCarsCollection.findOne(query)
      if (bookedCar) {
        return res.send({
          acknowledged: false,
          message: "You have already booked this car"
        })
      }
      const result = await bookedCarsCollection.insertOne(booking)

      res.send(result)
    })
  } finally { }
}

run().catch(err => console.error(err))

app.get("/", (req, res) => {
  res.send("Used Cars Mart server is running")
})

app.listen(port, () => console.log("Server is running on port: ", port))