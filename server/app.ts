const express = require('express');
const cors = require('cors');

const errorHandlers = require('./handlers/errorHadler');

const app:any = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/user', require('./routes/user'));

if (process.env.ENV === 'DEVELOPMENT') {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);

module.exports = app;
