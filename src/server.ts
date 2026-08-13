import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { startReminderJob } from './jobs/reminder.job';
import './config/redis';

async function start() {
  await connectDB();
  startReminderJob();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

start();