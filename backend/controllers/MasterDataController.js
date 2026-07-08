const db = require('../models');

// === MASTER TARIFF ===
exports.getTariffs = async (req, res) => {
  try {
    const tariffs = await db.mastertariff.findAll({
      order: [['call_type', 'ASC'], ['prefix', 'ASC']]
    });
    res.json(tariffs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTariff = async (req, res) => {
  try {
    const tariff = await db.mastertariff.create(req.body);
    res.status(201).json(tariff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTariff = async (req, res) => {
  try {
    const { id } = req.params;
    await db.mastertariff.update(req.body, { where: { id } });
    const updated = await db.mastertariff.findByPk(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTariff = async (req, res) => {
  try {
    const { id } = req.params;
    await db.mastertariff.destroy({ where: { id } });
    res.json({ message: 'Tariff deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === MASTER USERS ===
exports.getUsers = async (req, res) => {
  try {
    const users = await db.masterusersextension.findAll({
      include: [
        { model: db.masterteam, as: 'team', include: ['department'] }
      ],
      order: [['name', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await db.masterusersextension.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.masterusersextension.update(req.body, { where: { id } });
    const updated = await db.masterusersextension.findByPk(id, {
      include: [
        { model: db.masterteam, as: 'team', include: ['department'] }
      ]
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.masterusersextension.destroy({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === MASTER DEPARTMENTS ===
exports.getDepartments = async (req, res) => {
  try {
    const departments = await db.masterdepartment.findAll({
      order: [['department_code', 'ASC']]
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const dept = await db.masterdepartment.create(req.body);
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.masterdepartment.update(req.body, { where: { id } });
    const updated = await db.masterdepartment.findByPk(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.masterdepartment.destroy({ where: { id } });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === MASTER TEAMS ===
exports.getTeams = async (req, res) => {
  try {
    const teams = await db.masterteam.findAll({
      include: [{ model: db.masterdepartment, as: 'department' }],
      order: [['team_code', 'ASC']]
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const team = await db.masterteam.create(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await db.masterteam.update(req.body, { where: { id } });
    const updated = await db.masterteam.findByPk(id, {
      include: [{ model: db.masterdepartment, as: 'department' }]
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await db.masterteam.destroy({ where: { id } });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
