import express from 'express';
import userController from '../controllers/userController';
import passport from 'passport';
const router = express.Router();

router.get('/profile/:userId', userController.getUserProfile);
router.get('/', userController.getUserProfile);
// router.put('/profile/:userId', userController.updateUserProfile);
 router.delete('/profile/:userId', userController.deleteUserProfile);
router.get('/getUserId/:username', userController.getUserById);
router.get('/search', userController.searchUsers);
// Route for requesting a password reset
router.post('/request-password-reset', userController.requestPasswordReset);
// Route for resetting the password
router.post('/reset-password', userController.resetPassword);
router.put('/profile/:userId', userController.updateUserProfile);
router.put('/change-password', passport.authenticate('jwt', { session: false }), userController.changePassword);

export default router;