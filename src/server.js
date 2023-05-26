/*const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const routes = require('./routes');
*/

import express from 'express';
import bodyParser from 'body-parser';
import {router} from './router.js';

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(router);

app.get("/", (req, res) => {
    console.log("Response success")
    res.send("Response Success!")
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log("Server is up and listening on " + PORT)
})