'use strict';

const express = require('express');
const app = express();
const { apis } = require('./apiModels/apis');
const { routeMapper } = require('./parsers/api');

app.use(express.json());

module.exports = { routeMapper };
// routeMapper(apis, app);

// app.listen(2660, () => console.log('Listening to port 2660'));
