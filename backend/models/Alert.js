const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unread'
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  division: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    references: {
      model: 'Users', 
      key: 'id'
    }
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

// Create a separate model for tracking read status per user
const AlertReadStatus = sequelize.define('AlertReadStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  alert_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Alerts',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id' 
    }
  },
  read_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: false
});

// Set up associations
Alert.hasMany(AlertReadStatus, { foreignKey: "alert_id", as: "readStatuses" });
AlertReadStatus.belongsTo(Alert, { foreignKey: "alert_id", as: "alert" });

module.exports = { Alert, AlertReadStatus };
