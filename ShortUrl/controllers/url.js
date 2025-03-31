const URL = require('../models/url')
const shortid = require('shortid');

async function generateNewShortURL(req, res) {
    const body = req.body;

    if (!body.url) return res.status(400).json({ error: 'URL is required' });

    // Generate a new short ID
    const shortID = shortid.generate(); // Make sure to use generate()

    try {
        // Create the new URL entry
        const newURL = await URL.create({
            shortID: shortID, // Use the generated short ID
            redirectURL: body.url,
            visitedHistory: []
        });

        return res.status(201).json({ id: shortID, redirectURL: newURL.redirectURL });
    } catch (error) {
        console.error("Error creating short URL:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {generateNewShortURL}
