const express = require('express');
const app = express();

const postRoutes = require('./api/routes/posts');


app.use('/posts', postRoutes);

module.exports = app;