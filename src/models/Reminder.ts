import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReminder extends Document {
  ticket: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  fireAt: Date;
  sent: boolean;
  source: 'creator-default' | 'eventee-custom';
}

const reminderSchema = new Schema<IReminder>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    fireAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    source: { type: String, enum: ['creator-default', 'eventee-custom'], required: true },
  },
  { timestamps: true }
);

reminderSchema.index({ fireAt: 1, sent: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);