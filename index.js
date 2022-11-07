const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is working fine...");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});