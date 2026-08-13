import { signTicketToken, verifyTicketToken } from '../utils/qr';

describe('QR ticket token', () => {
  it('signs and verifies a valid token', () => {
    const token = signTicketToken({ ticketId: '123', eventId: '456' });
    const decoded = verifyTicketToken(token);
    expect(decoded.ticketId).toBe('123');
    expect(decoded.eventId).toBe('456');
  });

  it('throws on a tampered token', () => {
    const token = signTicketToken({ ticketId: '123', eventId: '456' });
    const tampered = token.slice(0, -2) + 'xx';
    expect(() => verifyTicketToken(tampered)).toThrow();
  });
});