import Razorpay from 'razorpay';
import { env } from './env';

export const getRazorpayInstance = () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ Razorpay credentials missing in environment. Running in Payment Simulation Mode.');
    return null;
  }

  try {
    return new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  } catch (err: any) {
    console.warn('⚠️ Razorpay SDK initialization warning:', err.message);
    return null;
  }
};

export const razorpayInstance = getRazorpayInstance();
