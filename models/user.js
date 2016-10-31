const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

const Schema = mongoose.Schema;

/*
* The user schema
*/
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  profile: {
    name: { type: String, default: '' },
    picture: { type: String, default: '' }
  },
  address: { type: String },
  history: [{
    date: Date,
    paid: { type: Number, default: 0 },
    // item: { type: Schema.types.ObjectId, ref: }
  }]
});

/*
* Hash the password before we save to the db
*/
UserSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password'))
    return next();
  bcrypt.genSalt(10, function(err, salt) {
    if(err)
      return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err)
        return next(err);
      user.password = hash;
      next();
    });
  });
});

/*
* Compare password in the db for login
*/
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.gravatar = function(size) {
  if (!this.size)
    size = 200;

  if (!this.email)
    return `https://gravatar.com/avatar/?s${size}&d=retro`;

  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
}

module.exports = mongoose.model('User', UserSchema);
