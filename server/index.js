/**
 * Vercel Serverless Function Entry Point
 * This file exports the Express app for Vercel's serverless environment
 */

const path = require('path');

// Set the correct paths for Vercel environment
if (process.env.VERCEL) {
    // In Vercel, we need to adjust paths
    process.chdir(path.join(__dirname));
}

// Import the main server application
const app = require('./server');

// Export for Vercel
module.exports = app;