const uuidv1 = require('uuid/v1');
const crypto = require('crypto');

module.exports = (sequelize, type) => {
  class User extends sequelize.Model { }
  User.init({
    name: {
      type: type.STRING,
      allowNull: false
    },
    email: {
      type: type.STRING,
      allowNull: false
    },
    password:{
      type: type.VIRTUAL,
      set: function(password){
        this._password = password;
        this.salt = uuidv1();
        this.hashed_password = this.encryptPassword(password);
      },
      get: function(){
        return this._password;
      }
    },
    hashed_password:{
      type: type.STRING,
      allowNull: false
    },
    salt:{
      type: type.STRING,
    },
    role:{
      type: type.STRING,
      defaultValue: 'User'
    },
    created:{
      type: type.DATE,
      defaultValue: type.NOW
    },
    updated:{
      type: type.DATE
    }
  }, {
    sequelize,
    modelName: 'mapalizeUser',
    timestamps: false
  });
  User.prototype.authenticate = function(plainText){
    return this.encryptPassword(plainText) === this.hashed_password;
  };

  User.prototype.encryptPassword = function(password){
    if(!password) return '';
    try{
      return crypto.createHmac('sha1', this.salt)
                   .update(password)
                   .digest('hex');
    } catch(err){
      return "";
    }
  };
  return User;
}
