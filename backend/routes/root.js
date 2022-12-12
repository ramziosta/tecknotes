const { response } = require('express');
const express = require('express');

const router = express.Router();

const path = require('path');
//> request goes to '/' or '/index' or '/index.html'
router.get('^/$|/index(.html)?', (req, res) =>{
    res.sendFile(path.join(__dirname, '../views/index.html'));
})

module.exports = router;