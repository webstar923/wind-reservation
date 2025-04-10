const Chat = require('../models/Chat');
const { Op } = require('sequelize'); // Import the Op operator from Sequelize

// Get all chats
const getAllChats = async (req, res) => {
  try {      
    const chats = await Chat.findAll();
    res.json({ message: 'チャット一覧を取得しました', data: chats });
  } catch (err) {
    res.status(500).json({ message: 'チャットの取得に失敗しました', error: err.message });
  }
};

// Create new chat
const createChat = async (req, res) => {
  try {    
    const chat = await Chat.create(req.body);    
    res.status(201).json({ message: 'チャットを作成しました', data: chat });
  } catch (err) {
    res.status(400).json({ message: 'チャットの作成に失敗しました。入力データを確認してください。', error: err.message });
  }
};

// Update chat by ID
const updateChat = async (req, res) => {
  try {
    const { id } = req.params;  
    const [updated] = await Chat.update(req.body, { where: { id } });

    if (updated) {
      const updatedChat = await Chat.findByPk(id);
      res.json({ message: 'チャットを更新しました', data: updatedChat });
    } else {
      res.status(404).json({ message: `ID: ${id} のチャットが見つかりませんでした` });
    }
  } catch (err) {
    res.status(400).json({ message: 'チャットの更新に失敗しました。入力データを確認してください。', error: err.message });
  }
};

// Delete chat by ID
const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;     
    const deleted = await Chat.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: `ID: ${id} のチャットを削除しました` });
    } else {
      res.status(404).json({ message: `ID: ${id} のチャットが見つかりませんでした` });
    }
  } catch (err) {
    res.status(500).json({ message: 'チャットの削除に失敗しました', error: err.message });
  }
};

module.exports = {
  getAllChats,
  createChat,
  updateChat,
  deleteChat,
};
