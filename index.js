const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// verifyJWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.send({message: 'Unauthorized Access'});
    }
    const token = authHeader.split(' ')[1];
    // console.log('Shamim', token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if(err) {
            return res.send({message: 'Unauthorized Access'});
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        const servicesCollection = client.db("creative-construction").collection("services");
        const reviewsCollection = client.db("creative-construction").collection("reviews");

        await client.connect();
        console.log("Database connect successfully.");

        // JWT Token API
        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            });
            // console.log({token});
            res.send({token});
        });

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
        app.get("/services/:id", async (req, res) => {
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

        // Add Review API
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
            console.log('Data added successfully...');
        });

        // Get API For ALL Reviews
        app.get("/reviews", async (req, res) => {
            const query = {};
            const sort = {reviewTime: -1};
            const cursor = reviewsCollection.find(query).sort(sort);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // Get API for Review by id
        app.get("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const reviews = await reviewsCollection.findOne(query);
            res.send(reviews);
        });

        app.get('/reviews/services/:id', async (req, res) => {
            const id = req.params.id;
            let query = {serviceId: id};
            const sort = {reviewTime: -1};
            const cursor = reviewsCollection.find(query).sort(sort);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // Need to jwt verify *******************************
        app.get('/reviews/services/email/:email', verifyJWT, async (req, res) => {

            // check jwt
            const decoded = req.decoded;
            console.log('my-reviews api', decoded);
            const email = req.params.email;
            if(decoded.email !== email) {
                res.send({message: 'Unauthorized Access'});
            }

            let query = {email: email};
            const sort = {reviewTime: -1};
            const cursor = reviewsCollection.find(query).sort(sort);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // Delete review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });

        // Update Review
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const review = req.body;
            const option = {upsert: true};
            const updateReview = {
                $set: {
                    ratings: review.ratings,
                    review: review.review
                }
            };
            const result = await reviewsCollection.updateOne(filter, updateReview, option);
            res.send(result);
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