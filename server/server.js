/* eslint-disable import/extensions */
require('dotenv').config();
const mongoose = require('mongoose');
// eslint-disable-next-line import/order
const app = require('./app.js');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5050;

const start = function startServer() {
  try {
    mongoose.connect(process.env.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    // eslint-disable-next-line no-console
    server.listen(PORT, () => console.log(`Server has been started on port ${PORT}...`));
  } catch (e) {
    process.exit(1);
  }
};

start();
require('./socket')(io);

module.exports = app;
