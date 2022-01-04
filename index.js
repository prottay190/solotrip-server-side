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
