const express = require('express');
const { connectionDB } = require('./connection');
const {logReqRes} = require('../project1/middleware')
const userRouter = require('./routes/user');


const app = express();
const PORT = 3300;

// Connection
const mongoURI = 'mongodb://127.0.0.1:27017/practise';

connectionDB(mongoURI)
    .then(() => console.log("Successful connection"))
    .catch((err) => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Include this to handle JSON requests

app.use(logReqRes('log.txt'))

// Routes
app.use('/api/users', userRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening at: ${PORT}`);
});
