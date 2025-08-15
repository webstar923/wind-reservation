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
  prefecture:{
    type:DataTypes.STRING,
  },
  company:{
    type:DataTypes.STRING,
  },
  pdf_url:{
    type:DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue:'予約済み'
  },
  installation_type_id: {
    type: DataTypes.INTEGER,
    unique: false,
  },
  start_time:{
    type:DataTypes.TIME,
  },
  end_time:{
    type:DataTypes.TIME,
  },},
  { 
    timestamps: false,
  });;

module.exports = Reservation;
