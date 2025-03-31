const fs = require('fs');

function logReqRes(filename) {
    return (req, res, next) => {
        const logEntry = `${Date.now()}: ${req.method} ${req.path}\n`;
        
        fs.appendFile(filename, logEntry, (err) => {
            if (err) {
                console.error("Error writing to log file:", err);
            }
            next(); // Call the next middleware or route handler
        });
    };
}

module.exports = { logReqRes };
