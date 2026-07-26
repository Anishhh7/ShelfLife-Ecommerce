import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as DashboardController from '../Controller/dashboardController.js';

const router = express.Router();

router.use(AuthController.protect);

router
  .route('/vendor-stats')
  .get(
    AuthController.restrictTo(...permission.dashboard.vendorStats),
    DashboardController.vendorDashboard
  );

router
  .route('/admin-stats')
  .get(
    AuthController.restrictTo(...permission.dashboard.adminStats),
    DashboardController.adminDashboard
);
  
export default router;
