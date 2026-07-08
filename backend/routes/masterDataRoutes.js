const express = require('express');
const router = express.Router();
const MasterDataController = require('../controllers/MasterDataController');

// --- Master Tariff Routes ---
router.get('/tariffs', MasterDataController.getTariffs);
router.post('/tariffs', MasterDataController.createTariff);
router.put('/tariffs/:id', MasterDataController.updateTariff);
router.delete('/tariffs/:id', MasterDataController.deleteTariff);

// --- Master Users Routes ---
router.get('/users', MasterDataController.getUsers);
router.post('/users', MasterDataController.createUser);
router.put('/users/:id', MasterDataController.updateUser);
router.delete('/users/:id', MasterDataController.deleteUser);

// --- Master Departments Routes ---
router.get('/departments', MasterDataController.getDepartments);
router.post('/departments', MasterDataController.createDepartment);
router.put('/departments/:id', MasterDataController.updateDepartment);
router.delete('/departments/:id', MasterDataController.deleteDepartment);

// --- Master Teams Routes ---
router.get('/teams', MasterDataController.getTeams);
router.post('/teams', MasterDataController.createTeam);
router.put('/teams/:id', MasterDataController.updateTeam);
router.delete('/teams/:id', MasterDataController.deleteTeam);

module.exports = router;
