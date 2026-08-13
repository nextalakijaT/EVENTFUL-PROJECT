import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TicketTokenPayload {
  ticketId: string;
  eventId: string;
}

export function signTicketToken(payload: TicketTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: '90d' });
}

export function verifyTicketToken(token: string): TicketTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as TicketTokenPayload;
}

export async function generateTicketQRCode(
  ticketId: string,
  eventId: string
): Promise<{ token: string; image: string }> {
  const token = signTicketToken({ ticketId, eventId });
  // the QR encodes the SIGNED TOKEN, not the raw ticketId — this is what
  // makes it unforgeable: anyone scanning it can't fake a valid signature
  const image = await QRCode.toDataURL(token);
  return { token, image };
}