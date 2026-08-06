import express from 'express';
import * as AuthController from '../Controller/authController.js';

const router = express.Router();

router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/forgot-password', AuthController.forgotPassword);
router.patch('/resetPassword', AuthController.resetPassword);
router.post('/refresh', AuthController.refresh);

router.use(AuthController.protect);

router.post('/logout', AuthController.logout);
router.patch('/updateMyPassword', AuthController.updatePassword);


export default router;
