const express = require('express');
const cors = require('cors');
const {MongoClient, ServerApiVersion} = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// middleware
app.use(express.json());
app.use(cors());

// const uri = process.env.DB_URI;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {
        const servicesCollection = client.db("creative-construction").collection("services");

        await client.connect();
        console.log("Database connect successfully.");

        app.get("/services", async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

    } catch(error) {
        console.error(error.message);
    }
}
run().catch(error => console.error(error));

app.get("/", (req, res) => {
    res.send("Server is working fine...");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});