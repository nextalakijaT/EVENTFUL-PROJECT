import mongoose, { Schema, Document, Types } from 'mongoose';

export type TicketStatus = 'pending' | 'paid' | 'failed' | 'used' | 'refunded';

export interface ITicket extends Document {
  event: Types.ObjectId;
  eventee: Types.ObjectId;
  amount: number;
  status: TicketStatus;
  paystackReference: string;
  qrCodeToken?: string;
  qrCodeImage?: string;
  usedAt?: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'used', 'refunded'],
      default: 'pending',
    },
    paystackReference: { type: String, required: true, unique: true },
    qrCodeToken: { type: String },
    qrCodeImage: { type: String },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);