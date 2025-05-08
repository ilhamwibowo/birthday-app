const mongoose = require('mongoose');
const { isEmail } = require('validator');
const moment = require('moment-timezone');

/**
 * User Schema
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Please provide a valid email address']
  },
  birthday: {
    type: Date,
    required: [true, 'Birthday is required'],
    validate: {
      validator: function(value) {
        // Birthday cannot be in the future
        return value <= new Date();
      },
      message: 'Birthday cannot be in the future'
    }
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    index: true,
    validate: {
      validator: function(value) {
        return moment.tz.zone(value) !== null;
      },
      message: props => `${props.value} is not a valid timezone`
    }
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
