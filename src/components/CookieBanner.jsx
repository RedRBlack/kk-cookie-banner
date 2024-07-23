import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import './banner.css';

const CookieBanner = ({ secretKey, measurementId, apiEndpoint, domain = 'localhost' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
  });

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  };

  const decryptData = (data) => {
    try {
      const bytes = CryptoJS.AES.decrypt(data, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  };

  const addGoogleAnalyticsScript = () => {
    const script1 = document.createElement('script');
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script1.defer = true;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
  };

  useEffect(() => {
    const cookieConsent = Cookies.get('cookie_consent');
    if (!cookieConsent) {
      setIsVisible(true);
    } else {
      const decryptedConsent = decryptData(cookieConsent);
      if (decryptedConsent) {
        setConsent(decryptedConsent);
        setIsVisible(false);
        if (decryptedConsent.statistics) {
          addGoogleAnalyticsScript();
        }
      } else {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAccept = async () => {
    try {
      const encryptedConsent = encryptData(consent);
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent: encryptedConsent }),
      });

      if (res.ok) {
        Cookies.set('cookie_consent', encryptedConsent, {
          expires: 365,
          secure: true,
          sameSite: 'strict',
          domain: domain,
        });
        setIsVisible(false);
        if (consent.statistics) {
          addGoogleAnalyticsScript();
        }
      } else {
        console.error('Failed to set consent:', await res.json());
      }
    } catch (error) {
      console.error('Error setting cookie consent:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setConsent((prevConsent) => ({
      ...prevConsent,
      [category]: !prevConsent[category],
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
        {consent.statistics && (
            <script
            dangerouslySetInnerHTML={{
                __html: `
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.googletagmanager.com/gtag/js?id=${measurementId}','ga');
                
                ga('create', '${measurementId}', 'auto');
                ga('send', 'pageview');
                `,
            }}
            />
        )}
        {isVisible && (
            <div className="banner">
                <p>We use cookies to improve your experience on our site. By using our site, you consent to cookies.</p>
                <div>
                    <label>
                    <input
                        type="checkbox"
                        checked={consent.necessary}
                        onChange={() => handleCategoryChange('necessary')}
                        disabled
                    />
                    Necessary
                    </label>
                    <label>
                    <input
                        type="checkbox"
                        checked={consent.preferences}
                        onChange={() => handleCategoryChange('preferences')}
                    />
                    Preferences
                    </label>
                    <label>
                    <input
                        type="checkbox"
                        checked={consent.statistics}
                        onChange={() => handleCategoryChange('statistics')}
                    />
                    Statistics
                    </label>
                    <label>
                    <input
                        type="checkbox"
                        checked={consent.marketing}
                        onChange={() => handleCategoryChange('marketing')}
                    />
                    Marketing
                    </label>
                </div>
                <button onClick={handleAccept} style={styles.button}>Accept</button>
            </div>
        )}
    </>
  );
};

export default CookieBanner;
