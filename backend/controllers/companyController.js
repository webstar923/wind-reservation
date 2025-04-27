const Company = require('../models/Company');
// Get all companies
const getAllCompanies = async (req, res) => {
  try {      
    const companies = await Company.findAll();
    const dataValues = companies.map(company => company.dataValues);
    res.status(201).json(dataValues);
  } catch (err) {
    res.status(500).json({ message: '会社資料の取得に失敗しました', error: err.message });
  }
};

// Create new company
const createCompany = async (req, res) => {
  try {    
    const company = await Company.create(req.body); 
    res.status(201).json({ message: '会社資料を作成しました', data: company });
  } catch (err) {
    res.status(400).json({ message: '会社資料の作成に失敗しました。入力データを確認してください。', error: err.message });
  }
};

// Update company by ID
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;  
    const [updated] = await Company.update(req.body, { where: { id } });

    if (updated) {
      const updatedCompany = await Company.findByPk(id);
      res.json({ message: '会社情報を更新しました', data: updatedCompany });
    } else {
      res.status(404).json({ message: `ID: ${id} の会社情報が見つかりませんでした` });
    }
  } catch (err) {
    res.status(400).json({ message: '会社情報の変更に失敗しました。入力データを確認してください。', error: err.message });
  }
};

// Delete company by ID
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;     
    const deleted = await Company.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: `ID: ${id} の会社情報を削除しました` });
    } else {
      res.status(404).json({ message: `ID: ${id} の会社情報が見つかりませんでした` });
    }
  } catch (err) {
    res.status(500).json({ message: '会社情報の削除に失敗しました', error: err.message });
  }
};

module.exports = {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};
