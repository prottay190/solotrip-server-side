const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
var ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(express.json());
app.use(cors());
// Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gvodb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// Create a new MongoClient
const client = new MongoClient(uri);
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    const database = client.db("solotrip");
    const hotelCollection = database.collection("hotelList");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    // get the hotel list form the database
    app.get("/hotels", async (req, res) => {
      console.log("hitting the documents database");
      const hotels = await hotelCollection.find({}).toArray();
      res.send(hotels);
    });
    // get a single hotel from the database with the ObjectId
    app.get("/hotels/:id", async (req, res) => {
      const hotel = await hotelCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.send(hotel);
    });
    // delete a product from the database
    app.delete("/hotels/:id", async (req, res) => {
      const id = req.params.id;
      const result = await hotelCollection.deleteOne({ _id: ObjectId(id) });
      res.json(result);
    });
    // save orders to the database
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });
    // get all orders from the database
    app.get("/orders", async (req, res) => {
      const orders = await ordersCollection.find({}).toArray();
      res.send(orders);
    });
    // get orders by users email from the database and return the orders
    app.get("/orders/:email", async (req, res) => {
      const orders = await ordersCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(orders);
    });
    // DELETE AN ORDER
    app.delete("/orders/:id", async (req, res) => {
      const query = req.params.id;
      const result = await ordersCollection.deleteOne({ _id: ObjectId(query) });
      res.send(result);
    });
    // save a user to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // get all the users form the database and return them
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find({}).toArray();
      res.send(users);
    });
    // check an user if he an admin
    app.get("/users/:email", async (req, res) => {
      const user = await usersCollection.findOne({ email: req.params.email });
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // make an admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const options = { upsert: true };
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
