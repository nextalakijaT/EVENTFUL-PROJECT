import mongoose, { Schema, Document, Types } from 'mongoose';
import { generateShortId } from '../utils/shortId';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  venue: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  createdBy: Types.ObjectId;
  reminderOffsetHours: number; // creator's default reminder, e.g. 24 = 1 day before
  shortId: string;
  imageUrl?: string;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    ticketsSold: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reminderOffsetHours: { type: Number, default: 24 },
    shortId: { type: String, unique: true, sparse: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

eventSchema.pre('save', function () {
  if (!this.shortId) {
    this.shortId = generateShortId();
  }
});

export const Event = mongoose.model<IEvent>('Event', eventSchema);