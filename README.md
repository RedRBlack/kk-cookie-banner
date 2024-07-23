# KK Cookie Banner

A reusable cookie consent banner component for React applications. This component handles user consent for cookies and integrates Google Analytics based on user preferences.

## Features

- Encrypts and decrypts user consent data
- Stores consent data in cookies
- Integrates with Google Analytics based on user consent
- Fully customizable and easy to use

## Installation

To install the package, run:

npm install kk-cookie-banner

You'll also need to have react, js-cookie, and crypto-js installed in your project. If they are not already installed, you can install them using:

npm install react js-cookie crypto-js

## Usage

# Import the Component
First, import the CookieBanner component into your React application:

import React from 'react';
import CookieBanner from 'my-cookie-banner';

const App = () => {
  return (
    <div>
      <CookieBanner
        secretKey={process.env.NEXT_PUBLIC_SECRET_KEY_CONSENT}
        measurementId={process.env.NEXT_PUBLIC_MEASUREMENT_ID}
        apiEndpoint="/api/set-consent"
        domain="yourdomain.com"
      />
      {/* Your application content */}
    </div>
  );
};

export default App;

## Add API Route
Create an API route to handle the consent data. Here's an example of a Next.js API route:

// pages/api/set-consent.js

import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY_CONSENT;

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

    const decryptedConsent = decryptData(consent);
    console.log('Decrypted consent:', decryptedConsent);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'cookie_consent',
      value: consent,
      secure: true,
      sameSite: 'strict',
      path: '/',
      domain: 'yourdomain.com',
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error in API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

## Environment Variables

Make sure to define the necessary environment variables in your project:

NEXT_PUBLIC_SECRET_KEY_CONSENT: The secret key used for encrypting and decrypting consent data.
NEXT_PUBLIC_MEASUREMENT_ID: Your Google Analytics measurement ID.

You can set these variables in a .env file:

NEXT_PUBLIC_SECRET_KEY_CONSENT=your-secret-key
NEXT_PUBLIC_MEASUREMENT_ID=your-measurement-id

## Customize the Banner

You can customize the styles and text of the banner by modifying the CookieBanner component. The default styles are defined in the styles object within the component.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature requests.

## Support
If you encounter any issues or have questions, feel free to open an issue on the GitHub repository.

## Acknowledgements
React
js-cookie
crypto-js




