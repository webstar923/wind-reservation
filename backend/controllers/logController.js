const Log = require('../models/Log');
const { Alert, AlertReadStatus } = require('../models/Alert');
const { Op } = require('sequelize'); // Import the Op operator from Sequelize
const limit = 10; 

const getErrorData = async (req, res) => {  
  try {  
    const ErrorData = await Log.findAll({
        where: {
          level: 'error'
        },
        attributes: ['id', 'level', 'message', 'timestamp'],
      });    


    const dataValues = ErrorData.map(error => error.dataValues);
    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }   
    
    res.status(201).json(dataValues);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getChangeData = async (req, res) => {  
  try {  
    const ChangeData = await Log.findAll({
        where: {
          level: 'change'
        },
        attributes: ['id', 'level', 'message', 'timestamp'],
      });    


    const dataValues = ChangeData.map(data => data.dataValues);
    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }   
    
    res.status(201).json(dataValues);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getApiLogData = async (req, res) => {  
  const { pageNum, searchTerm } = req.params;
  const limit = 10;  // Or you can pass it as a query parameter
  const offset = (pageNum - 1) * limit;
  try {
    let apiLogData;
    let totalItems;

    if (searchTerm === "!allData!") {
      // If searchTerm is '!allData!', return all logs without filtering
      apiLogData = await Log.findAll({
        attributes: ['id', 'level', 'message', 'timestamp','readStatus','endpoint','method','status_code','user_id','ip_address','request_id' ],
        limit: limit,
        offset: offset,
      });
      totalItems = await Log.count();  // Get total count of logs without search filter
    } else {
      // Otherwise, filter by searchTerm
      apiLogData = await Log.findAll({
        where: {
          message: {
            [Op.like]: `%${searchTerm}%`, // Partial match with wildcards
          },
        },
        attributes: ['id', 'level', 'message', 'timestamp','readStatus','endpoint','method','status_code','user_id','ip_address','request_id' ],
        limit: limit,
        offset: offset,
      });
      totalItems = await Log.count({
        where: {
          message: {
            [Op.like]: `%${searchTerm}%`,
          },
        },
      });  // Get count for logs matching search term
    }

    const totalPages = Math.ceil(totalItems / limit);
    const dataValues = apiLogData.map(data => data.dataValues);

    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching apiLogs found' });
    }

    res.status(200).json({
      data: dataValues,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getNotificationNum = async (req, res) => {  
  try {  
    const NotificationNum = await Log.count({
      where: {
        level: 'important',
        readStatus:'unread'
      }
    });

    const { role, id: userId } = req.user; // Extract user role and ID
    let alertConditions = {};
    if (role === "member") {
        alertConditions.division = { 
          [Op.in]: ["メンバー", "全員"],
         };       
    }else if(role === "user"){
      alertConditions.division = { [Op.in]: ["ユーザー", "全員"] };
    }else if(role === "manager"){
      alertConditions.division = { [Op.in]: ["管理者"] };
    }

    const alerts = await Alert.findAll({
      where: alertConditions,
      include: [
        {
          model: AlertReadStatus,
          as: "readStatuses",
          required: false, 
          where: { user_id: userId }, 
          attributes: ["alert_id", "read_status"],
        },
      ],
    });

    const unreadAlerts = alerts.filter(alert => {
      if (alert.readStatuses.length === 0) {
        if (alert.division === "メンバー") {
          return alert.user_id === userId || alert.user_id === 0 ;
        }
        return alert;
      }      
    });

    const MessageNum =unreadAlerts.length;

    res.status(201).json({NotificationNum,MessageNum});
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getNotificationData = async (req, res) => {  
  try {  
    const notificationData = await Log.findAll({
      where: {
        level: 'important',
        readStatus: 'unread'
      },
      attributes: ['id', 'level', 'message', 'timestamp'],
    });

    // if (notificationData.length > 0) {
    //   await Log.update(
    //     { readStatus: 'read' },
    //     {
    //       where: {
    //         level: 'important',
    //         readStatus: 'unread'
    //       }
    //     }
    //   );
    // }


    res.status(200).json({ notificationData});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getNotificationUpdate = async (req, res) => {  
  try {  

    const Notification = await Log.findByPk(req.params.id);
    Notification.readStatus = "read";
    await Notification.save();
    res.status(200).json({ Notification});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
    getErrorData,getChangeData,getApiLogData,getNotificationNum,getNotificationData,getNotificationUpdate
  };
