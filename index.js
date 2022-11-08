const express = require('express');
const cors = require('cors');
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
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

        // Get API For 3 Services
        app.get("/services3", async (req, res) => {
            const query = {};
            const sort = {_id: -1};
            const cursor = servicesCollection.find(query).sort(sort).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });

        // Get API For ALL Services
        app.get("/services", async (req, res) => {
            const query = {};
            const sort = {_id: -1};
            const cursor = servicesCollection.find(query).sort(sort);
            const services = await cursor.toArray();
            res.send(services);
        });

        // Get API for Service by id
        app.get("/service/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });

        // Add Service API
        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result);
            console.log('Data added successfully...');
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