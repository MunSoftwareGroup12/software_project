var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require('./routes/index');
const calculatedRoutesRouter = require('./routes/calculated-routes');
const mapRouter = require('./routes/map');
const cors = require('cors');

var app = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());    
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/calculated-routes', calculatedRoutesRouter);
app.use('/map', mapRouter);

module.exports = app;
