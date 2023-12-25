import { Router, Response } from 'express';
import { Document } from 'mongoose';
import { getItems, postItem, RequestWithUser } from '../controllers/itemController';
import passport from 'passport';
export default function createItemRoutes(): Router {
  const router = Router();

  console.log("Creating Item Routes");
  router.get('/', passport.authenticate('jwt', { session: false }), getItems as any);
  router.post('/', postItem as any);
  console.log("Item Routes Created");
  return router;
}