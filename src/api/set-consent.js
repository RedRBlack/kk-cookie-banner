import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js'; 

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY_CONSENT; // Ensure the secret key is loaded
const PRODUCTION_COOKIE = process.env.CONSENT_PRODUCTION_DEVELOPMENT;

const decryptData = (data) => {
  try {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
};

export async function POST(request) {
  try {
    const { consent } = await request.json();

    // Decrypt the consent data
    const decryptedConsent = decryptData(consent);

    // Additional server-side validations can be performed here
    console.log('Decrypted consent:', decryptedConsent);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'cookie_consent',
      value: consent,
    //   httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      domain: 'LOCALHOST',
      maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    });

    return response;
  } catch (error) {
    console.error('Error in API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
