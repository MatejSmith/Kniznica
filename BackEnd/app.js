const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World! This is an Express.js app.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
