import express from 'express';
import * as followController from '../controllers/followsController';

const router = express.Router();

router.post('/follow', followController.followUser);
router.post('/unfollow', followController.unfollowUser);
router.get('/followers/:userId', followController.getFollowers);
router.get('/following/:userId', followController.getFollowing);
router.get('/isFollowing', followController.isFollowing);

export default router;