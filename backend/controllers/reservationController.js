const { Sequelize,Op } = require('sequelize'); // Import the Op operator from Sequelize
const Flat = require('../models/Flat'); // Your Flat model
const Work = require('../models/Work');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const logger = require('../logger');

// Find Flat by partial match on the name

const TOTAL_WORKERS = 3; // 作業者の合計人数
const ALL_TIME_SLOTS = ["09:00", "12:00", "15:00", "18:00"]; // 利用可能な時間帯

// 午前と午後の時間帯
const AM_RANGE = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const PM_RANGE = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];



const findFlat = async (req, res) => {
  try {
    const { name } = req.body; // Extract name from the request body
    console.log('Received name:', name);

    // If no name is provided, return a 400 error
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Use Sequelize's Op.like to search for flats that partially match the name
    const flats = await Flat.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%` // Partial match with wildcards
        }
      }
    });

    if (flats.length === 0) {
      return res.status(404).json({ message: 'No flats found with that name' });
    }
    const dataValues = flats.map(flat => flat.dataValues);
    return res.status(200).json({dataValues}); // Return the found flats as a response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const findReservation = async (req, res) => {
  try {
    const { reservation_id } = req.body; // Extract name from the request body   

    // If no name is provided, return a 400 error
    if (!reservation_id) {
      return res.status(400).json({ message: 'reservation_id is required' });
    }

    // Use Sequelize's Op.like to search for flats that partially match the name
    const reservations = await Reservation.findAll({
      where: {id: reservation_id }
    });

    if (reservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found with that id' });
    }
    const dataValues = reservations.map(reservation => reservation.dataValues);
    return res.status(200).json({dataValues}); // Return the found flats as a response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const findChangeDate = async (req, res) => {
  try {
    const { reservation_id } = req.body; // Extract reservation_id from the request body   

    if (!reservation_id) {
      return res.status(400).json({ message: 'reservation_id is required' });
    }

    // Fetch the reservation
    const reservation = await Reservation.findOne({
      where: { id: reservation_id }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'No reservation found with that id' });
    }   

    const { room_num, work_name, flat_name } = reservation.dataValues;
    const whereConditions = { flat_name, work_name, room_num };
    
    console.log("Search conditions:", whereConditions);

    // Find matching works
    const works = await Work.findAll({ where: whereConditions });

    if (works.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }

    // Ensure __getDatesBetween function exists
    if (typeof __getDatesBetween !== "function") {
      throw new Error("Function __getDatesBetween is not defined");
    }

    const allDates = works.flatMap(work => 
      __getDatesBetween(work.start_time, work.end_time)
    );

    // Find booked reservations
    const bookedReservations = await Reservation.findAll({ where: whereConditions });

    // Extract reserved dates safely
    const reservedDates = bookedReservations
      .filter(res => res.dataValues.reservation_time)
      .map(res => res.dataValues.reservation_time.toISOString().split('T')[0]);

    // Compute available dates
    const availableDates = allDates.filter(date => !reservedDates.includes(date));
    
    return res.status(200).json({ availableDates });

  } catch (err) {
    console.error("Error in findChangeDate:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateReservation = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body; // id を分離し、更新対象のフィールドを取得

    const reservation = await Reservation.findByPk(Number(id));

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // null ではないプロパティのみを更新
    const filteredFields = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== null && value !== undefined)
    );

    if (Object.keys(filteredFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updatedReservation = await reservation.update(filteredFields);

    return res.status(200).json(updatedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const findWork = async (req, res) => {
  
  try {
    const { room_num, flat_name } = req.body;

    if (!room_num) {
      return res.status(400).json({ message: 'room_num is required' });
    }

    if (!flat_name) {
      return res.status(400).json({ message: 'flat_name is required' });
    }

    // Get the current time in the same format as the database (i.e., TIME type)
    const currentTime = new Date();
    
    // Set the where condition for Sequelize query
    const whereConditions = {
      flat_name: flat_name,
      room_num: room_num,      
    };
    // Query works using Sequelize
    const works = await Work.findAll({
      where: whereConditions,
    });
    
    // Check if no works are found
    if (works.length === 0) {
      return res.status(404).json({ message: 'No works found during the current time' });
    }

    // Return found works
    return res.status(200).json(works);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
const getChangeableDate = async (req, res) => {
  try {
    const {work_name,flat_name,room_num} = req.body; // Extract name from the request body   
    
    const whereConditions = {
      flat_name: flat_name,
      work_name: work_name,
      room_num : room_num,
    };
    
    const works = await Work.findAll({
      where: whereConditions,
    });

    if (works.length === 0) {
      return res.status(404).json({ message: 'No matching works found for the given reservation' });
    }
    const allDates = works.flatMap(work =>
      __getDatesBetween(work.start_time, work.end_time)
    );
    const bookedReservations = await Reservation.findAll({
      where: whereConditions,
    });
    const reservedDates = bookedReservations.flatMap(reservation => 
     reservation.dataValues.reservation_time.toISOString().split('T')[0]
    );
    const availableDates = allDates.filter(date => {
      return !reservedDates.includes(date);
    });
    return res.status(200).json({availableDates}); // Return the found flats as a response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
function __getDatesBetween(startTime, endTime) {
  const dates = [];
  let currentDate = new Date(); // Start from startTime  
  const end = new Date(endTime);
  while (currentDate.toISOString().split('T')[0] <= end.toISOString().split('T')[0]) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
const createReservation = async (req, res) => {  
  try {
    const {customer_address,start_time,customer_name,customer_phoneNum,history} = req.body;


    if (!customer_address||!start_time||!customer_name||!customer_phoneNum) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
   
    
    // const allWorkers = await User.findAll({where:{role:"member"}, attributes: ['id'] });
 

    // const [year, month, day] = start_time.split("-").map(Number);
    // const [hour, minute] = start_time.split(":").map(Number);
    // const dd = new Date(year, month - 1, day, hour, minute);
    // const end_time = new Date(dd);
    // end_time.setHours(end_time.getHours() + 2);
    // console.log(end_time);
    // const formattedDate = dd.toISOString().slice(0, 19).replace("T", " ");  
    // const reservedWorkers = await Reservation.findAll({
    //   where: {
    //     start_time: formattedDate  
    //   },
    //   attributes: ['worker_id']
    // });
    // const reservedWorkerIds = new Set(reservedWorkers.map(worker => worker.worker_id));
    
    // console.log(reservedWorkerIds);
    
    // const availableWorkers = allWorkers
    //   .map(worker => worker.id) 
    //   .filter(id => !reservedWorkerIds.has(id))  
    //   .sort((a, b) => a - b);  
      
    //   const workerReservations = await Reservation.findAll({
    //     where: {
    //       worker_id: availableWorkers,  // 予約されていない作業者のみ対象
    //       start_time: { [Op.gt]: new Date() } // 未来の予約のみ
    //     },
    //     attributes: ['worker_id', [Sequelize.fn('COUNT', Sequelize.col('worker_id')), 'reservation_count']],
    //     group: ['worker_id']
    //   });   
    //   let minReservations = Infinity;
    //   let selectedWorkerId = null;
  
    //   if (workerReservations.length === 0) {
    //     // 予約のない作業者がいる場合、そのうち最小のIDを選択
    //     selectedWorkerId = availableWorkers.sort((a, b) => a - b)[0];
    //   } else {
    //     const reservationCountMap = Object.fromEntries(workerReservations.map(r => [r.worker_id, Number(r.get('reservation_count'))]));
  
    //     availableWorkers.forEach(workerId => {
    //       const count = reservationCountMap[workerId] || 0; 
    //       if (count < minReservations) {
    //         minReservations = count;
    //         selectedWorkerId = workerId;
    //       }
    //     });
    //   }
      const formattedHistory = history.map(item => `${item.key}: ${item.value}`).join("\n");
      const newReservatoin = await Reservation.create({customer_name,customer_address,customer_phoneNum,start_time:start_time,end_time:start_time});
      const newHistory = await ChatHistory.create({reservation_id:newReservatoin.id, history:formattedHistory});
      logger.logInfo(customer_name+'ユーザーによって新しい予約が登録されました。', req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
      res.status(201).json(newReservatoin);


    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getReservations = async (req, res) => {  
  
  try {  
    const { customer_name, customer_phoneNum } = req.body;
    console.log(customer_name,customer_phoneNum);
    
    const bookedReservation = await Reservation.findAll({
      where: {
        customer_name: customer_name,
        customer_phoneNum: Number(customer_phoneNum),
        start_time: { [Op.gt]: new Date() },
    }}); 
    res.status(201).json(bookedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReservationListData = async (req, res) => {
  try {
    const { startTime, endTime } = req.body; 
    const start = new Date(startTime);
    const end = new Date(endTime);
    const bookedReservations = await Reservation.findAll({
      where: {      
        start_time: {
          [Op.between]: [start, end], 
        },
      },
    });
    
    
    const dataValues = bookedReservations.map((reservation) => {
      const reservationTime = new Date(reservation.dataValues.start_time);
      const formattedDate = reservationTime.toISOString().split('T')[0]; 
      return {
        ...reservation.dataValues,
        reservation_time: formattedDate,
      };
    });

    if (dataValues.length === 0) {
      return res.status(404).json({ message: 'No matching reservations found for the given time range' });
    }
    res.status(201).json(dataValues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.body;
   
    if (!id) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    const reservationToDelete = await Reservation.findOne({ where: { id } });
    if (!reservationToDelete) {
      return res.status(404).json({ message: '予約を見つかりません' });
    }
    await Reservation.destroy({ where: { id } });
    logger.logImportantInfo(reservationToDelete.id+'予約が削除されました。', req.id, req.originalUrl, req.method, res.statusCode, req.user?req.user.id : null, req.ip);
    res.status(200).json({ message: '予約が削除されました', reservation: reservationToDelete });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const getDashboardData = async (req, res) => {
  try {
   
    totalUserItems = await User.count();
    totalReservationItems = await Reservation.count();
    futureReservationItems = await Reservation.count({
      where: {
        start_time: { [Op.gt]: new Date() },
      }
    });
    cancelReservationNum = await Reservation.count({
      where: {
        status: "キャンセル",
      }
    });
    
    const monthlyReservations = await Reservation.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('start_time'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), '予約件数'],
      ],
      where: {
        start_time: {
          [Op.gte]: Sequelize.fn('DATE_SUB', Sequelize.fn('CURDATE'), Sequelize.literal('INTERVAL 12 MONTH')), // 現在から過去12ヶ月
          [Op.lte]: Sequelize.fn('CURDATE'), // 現在の日付
        },
      },
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('start_time'), '%Y-%m')],
      order: [[Sequelize.literal('month'), 'ASC']],
      raw: true, 
    });   
    res.status(200).json({futureReservationItems,totalUserItems,totalReservationItems,monthlyReservations,cancelReservationNum});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const getAllReservationData = async (req, res) => {
  try {
 
    pastReservationItems = await Reservation.findAll({
      where: {
        start_time: { [Op.lte]: new Date() },
      }
    });
   
    res.status(200).json(pastReservationItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const getFutureReservationData = async (req, res) => {
  try {
 
    pastReservationItems = await Reservation.findAll({
      where: {
        start_time: { [Op.gte]: new Date() },
      }
    });
   
    res.status(200).json(pastReservationItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

const getAvailableDate = async (req, res) => {
  try {
    const { selectedDate } = req.body;
    console.log("Selected Date:", selectedDate);

    // Validate input
    if (!selectedDate) {
      return res.status(400).json({ message: "selectedDate is required" });
    }
    // Fetch reservations
    const reservations = await Reservation.findAll({
      where: Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('end_time')),
        new Date(selectedDate)
      ),
      attributes: ['worker_id', 'start_time', 'end_time'], // Ensure required fields are selected
    });   

    const workerReservations = {};
    reservations.forEach(res => {
      if (!workerReservations[res.worker_id]) {
        workerReservations[res.worker_id] = { AM: false, PM: false };
      }

      // Determine if the reservation is in the AM or PM range
      const timeSlot = res.start_time < "12:00:00" ? "AM" : "PM";
      const dateTime = new Date(res.start_time);
      const hours = String(dateTime.getHours()).padStart(2, "0");
      const minutes = String(dateTime.getMinutes()).padStart(2, "0");
      const start_time = hours+":"+minutes; // Output: "08:49"
            console.log(start_time);
            
      if (AM_RANGE.includes(start_time)) {
        workerReservations[res.worker_id].AM = true;
      } else if (PM_RANGE.includes(start_time)) {
        workerReservations[res.worker_id].PM = true;
      }
    });
    
    console.log(workerReservations)
    // Fetch all workers
    const workers = await User.findAll({
      where: { role: "member" },
      attributes: ['id'],
    });

    const availableSlots = [];
    // Check available slots per worker
    workers.forEach(worker => {
      const workerId = worker.dataValues.id;
      const workerData = workerReservations[workerId] || { AM: false, PM: false };

      if (!workerData.AM) {
        availableSlots.push(...AM_RANGE.filter(time => ALL_TIME_SLOTS.includes(time)));
      }

      if (!workerData.PM) {
        availableSlots.push(...PM_RANGE.filter(time => ALL_TIME_SLOTS.includes(time)));
      }
    });

    // Remove duplicates
    const uniqueAvailableSlots = [...new Set(availableSlots)];
    console.log(uniqueAvailableSlots);

    return res.json({
      available: uniqueAvailableSlots.length > 0,
      availableSlots: uniqueAvailableSlots,
    });

  } catch (err) {
    console.error("Error fetching available slots:", err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
const getChatHistoryByid = async (req, res) => {
  try {
    ChatHistories = await ChatHistory.findAll({
      where: {
        reservation_id: req.body.id,
      }
    });
   
    res.status(200).json(ChatHistories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
module.exports = { 
  findFlat, findWork, findReservation, findChangeDate, 
  updateReservation,  getChangeableDate, createReservation,
   getReservations,getReservationListData,deleteReservation, 
   getDashboardData,   getAllReservationData, getAvailableDate,
   getFutureReservationData,getChatHistoryByid
  
  };
