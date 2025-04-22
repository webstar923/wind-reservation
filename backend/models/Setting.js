const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Setting = sequelize.define('Setting', {
  T_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, { 
  timestamps: false,
});

module.exports = Setting;
