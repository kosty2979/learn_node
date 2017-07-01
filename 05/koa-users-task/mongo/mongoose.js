const mongoose = require('mongoose');
const config = require('config');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
mongoose.plugin(beautifyUnique)
mongoose.Promise = Promise;


mongoose.connect(config.get('mongoHost'), {
  server: {
    socketOptions: {
      keepAlive: 1
    },
    poolSize:      5
  }
});

module.exports = mongoose;
