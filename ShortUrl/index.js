const express = require('express');
const { connectDB } = require('./connect');
const urlRoute = require('./routes/url');
const URL = require('./models/url');

const app = express();
const port = 3100;

// Connect to the database
connectDB("mongodb://127.0.0.1:27017/urlShort")
    .then(() => console.log("Successful connection"))
    .catch((err) => console.log(err));

// Middleware to parse JSON
app.use(express.json());

// URL routes
app.use('/url', urlRoute);

// Redirect based on short ID
app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortID;

    try {
        const result = await URL.findOneAndUpdate(
            { shortID: shortId }, // Ensure you match the correct field name
            { $push: { visitedHistory: { timestamp: Date.now() } } },
        );

        if (!result) {
            return res.status(404).json({ message: 'URL not found' });
        }

        // Redirect to the original URL
        res.redirect(result.redirectURL);
    } catch (error) {
        console.error("Error retrieving URL:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
