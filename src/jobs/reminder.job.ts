import cron from 'node-cron';
import { Reminder } from '../models/Reminder';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { sendReminderEmail } from '../services/email.service';

export function startReminderJob(): void {
  // runs every minute, checking for reminders whose time has arrived
  cron.schedule('* * * * *', async () => {
    try {
      const dueReminders = await Reminder.find({
        fireAt: { $lte: new Date() },
        sent: false,
      }).limit(50);

      for (const reminder of dueReminders) {
        const user = await User.findById(reminder.user);
        const event = await Event.findById(reminder.event);
        if (!user || !event) continue;

        try {
          await sendReminderEmail({
            to: user.email,
            eventTitle: event.title,
            eventDate: event.date,
            venue: event.venue,
          });
          reminder.sent = true;
          await reminder.save();
        } catch (emailErr) {
          console.error(`Failed to send reminder ${reminder._id}:`, emailErr);
          // leave sent = false so it retries on the next tick
        }
      }
    } catch (err) {
      console.error('Reminder job failed:', err);
    }
  });

  console.log('Reminder cron job started');
}