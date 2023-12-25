// app.ts
import express, { Express } from 'express';
import passport from 'passport';
import createItemRoutes from './src/routes/itemRoutes';
import characterRoutes from './src/routes/characterRoutes';

const app: Express = express();

app.use(passport.initialize());
app.use(express.json());
app.use('/items', createItemRoutes());
app.use('/characters', characterRoutes);

export default app;
