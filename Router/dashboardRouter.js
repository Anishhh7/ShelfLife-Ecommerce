import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as DashboardController from '../Controller/dashboardController.js';

const router = express.Router();

router.use(AuthController.protect);

router.get(
  '/vendor-stats',
  AuthController.restrictTo(...permission.dashboard.vendorStats),
  DashboardController.vendorDashboard
);

router.get(
  '/admin-stats',
  AuthController.restrictTo(...permission.dashboard.adminStats),
  DashboardController.adminDashboard
);

router.get(
  '/my-stats',
  AuthController.restrictTo(...permission.dashboard.customerStats),
  DashboardController.customerDashboard
);

export default router;
