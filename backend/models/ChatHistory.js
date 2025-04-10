const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const ChatHistory = sequelize.define('ChatHistory', {
  reservation_id: {
    type: DataTypes.STRING,
    allowNull: false,    
  },
  history: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },},
  { 
    timestamps: false,
  });

module.exports = ChatHistory;
