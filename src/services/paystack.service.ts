import axios from 'axios';
import { env } from '../config/env';

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${env.paystackSecretKey}`,
    'Content-Type': 'application/json',
  },
});

interface InitializeParams {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
}

export async function initializeTransaction(params: InitializeParams) {
  const response = await paystackClient.post('/transaction/initialize', {
    email: params.email,
    amount: Math.round(params.amount * 100), // Paystack expects kobo
    reference: params.reference,
    metadata: params.metadata,
    callback_url: `${env.clientUrl}/payment/callback`,
  });
  return response.data.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const response = await paystackClient.get(`/transaction/verify/${reference}`);
  return response.data.data as { status: string; amount: number; reference: string };
}