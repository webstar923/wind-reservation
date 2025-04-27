const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Company = sequelize.define('company', {
  company_name: {
    type: DataTypes.STRING,
    allowNull: false,    
  },
  representative_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  available_prefecture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  available_cities: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  available_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },},
  { 
    timestamps: false,
  });

module.exports = Company;
