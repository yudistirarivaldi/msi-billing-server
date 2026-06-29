const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');

// Route untuk Invoicing
router.get('/invoice-user', ReportController.getInvoicePerUser);
router.get('/invoice-dept', ReportController.getInvoicePerDepartment);
router.get('/invoice-cost-center', ReportController.getInvoicePerCostCenter);

// Route untuk Dashboard & Utilization
router.get('/top-callers', ReportController.getTopCallers);
router.get('/utilization', ReportController.getUtilization);
router.get('/summary', ReportController.getSummary);
router.get('/dashboard-stats', ReportController.getDashboardStats);
router.get('/recent-calls', ReportController.getRecentCalls);
router.get('/user-calls/:userId', ReportController.getUserCalls);

// Route untuk Alert & Abnormal
router.get('/abnormal-calls', ReportController.getAbnormalCalls);
router.get('/long-calls', ReportController.getLongCalls);

module.exports = router;
