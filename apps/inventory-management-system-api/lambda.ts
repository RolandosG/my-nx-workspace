import awsServerlessExpress from 'aws-serverless-express';
import app from './app';

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  // Pass the AWS event and context to awsServerlessExpress
  awsServerlessExpress.proxy(server, event, context);
};