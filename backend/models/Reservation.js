const { DataTypes, TIME, ENUM } = require('sequelize');
const sequelize = require('./index');

const Reservation = sequelize.define('Reservation', {
  worker_id: {
    type: DataTypes.STRING,
    unique: false,
  },
  customer_name:{
    type:DataTypes.STRING,
  },
  customer_address:{
    type:DataTypes.STRING,
  },
  customer_phoneNum:{
    type:DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue:'予約済み'
  },
  installation_type_id: {
    type: DataTypes.INTEGER,
    allowNull:true,
    unique: false,
  },
  start_time:{
    type:DataTypes.TIME,
    allowNull: false,
  },
  end_time:{
    type:DataTypes.TIME,
    allowNull: false,
  },},
  { 
    timestamps: false,
  });;

module.exports = Reservation;
