import { Router } from 'express';
import * as momentController from '../controllers/momentController';
import passport from 'passport';
import { checkUserConsent } from '../utils/middleware';
import { getAggregatedData } from '../controllers/moodAggregator';
import { getLastGlobalPostTime } from '../controllers/momentController';
import Moment from '../models/momentModel';
export default function createMomentRoutes(): Router {
  const router = Router();
  
  console.log("Creating Moment Routes");

  router.post('/capture', 
    passport.authenticate('jwt', { session: false }), checkUserConsent,
    momentController.captureMoment
  );

  router.post('/toggle-like/:momentId',
  passport.authenticate('jwt', { session: false }), // Authentication
  momentController.toggleLike // Your toggleLike function
  );
  router.get('/trending-moments-by-likes',
  passport.authenticate('jwt', { session: false }), // Authentication
  momentController.getTrendingMomentsByLikes // Your newly named function
  );
  router.get('/:userId/my-moments', 
    passport.authenticate('jwt', { session: false }), 
    momentController.getMyMoments
  );
  router.get('/most-liked-moments',
  passport.authenticate('jwt', { session: false, failureRedirect: '/unauthorized' }),
  momentController.getMostLikedMoments
  );
  router.get('/lastGlobalPostTime', 
  passport.authenticate('jwt', { session: false }),
  getLastGlobalPostTime
  );
  router.get('/unauthorized', (req, res) => {
  res.status(401).json({ message: 'Unauthorized: Invalid token or token expired.' });
  });
  
  /*router.get('/trending', 
    passport.authenticate('jwt', { session: false }), 
    momentController.getTrendingMoments
  );*/
  
  router.get('/trending', momentController.getTrendingMoments);
  
  router.get('/random', passport.authenticate('jwt', { session: false }), momentController.getRandomMoments);

  router.get('/getAggregatedMood', async (req, res) => {
    try {
      const data = await getAggregatedData();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  router.get('/liked-moments', 
  passport.authenticate('jwt', { session: false }),
  momentController.getLikedMoments
  );
  router.get('/:id', 
  // passport.authenticate('jwt', { session: false }),
  momentController.getMomentById
  );

  router.delete('/:id', async (req, res) => {
    try {
      const momentId = req.params.id;
      const moment = await Moment.findById(momentId);
      if (!moment) {
        return res.status(404).send('Moment not found');
      }
      await moment.deleteOne();
      res.status(200).send('Moment deleted successfully');
    } catch (error) {
      res.status(500).send('Server error');
    }
  });

  router.get('/following-moments/:userId',
    passport.authenticate('jwt', { session: false }),
    momentController.getFollowingMoments
  );
  console.log("Moment Routes Created");

  return router;
}
