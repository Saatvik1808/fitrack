import { useEffect, useState, useRef } from 'react';

// Default meal times (24h format)
const DEFAULT_TIMES = {
  breakfast: '09:00',
  lunch: '13:00',
  dinner: '19:00'
};

export function useNotifications(mealTimes = DEFAULT_TIMES) {
  const [permission, setPermission] = useState('default');
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    // Check initial permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const p = await Notification.requestPermission();
      setPermission(p);
      return p === 'granted';
    }

    return false;
  };

  const sendNotification = (title, body) => {
    if (permission === 'granted') {
      // We check if a service worker registration exists (needed for mobile browsers sometimes)
      navigator.serviceWorker?.getRegistration().then(reg => {
        if (reg) {
          reg.showNotification(title, {
            body,
            icon: '/icon-192x192.png', // Assuming standard PWA icon exists, adjust if needed
            vibrate: [200, 100, 200, 100, 200],
            tag: 'meal-reminder'
          });
        } else {
          // Fallback to standard web notification
          new Notification(title, {
            body,
            icon: '/icon-192x192.png'
          });
        }
      }).catch(() => {
        // Fallback to standard web notification if SW fails
        new Notification(title, {
          body,
          icon: '/icon-192x192.png'
        });
      });
    }
  };

  // Helper to format Date to HH:MM string
  const getHHMM = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper to check if we already sent a notification for a specific meal today
  const hasSentToday = (mealName) => {
    const today = new Date().toLocaleDateString();
    const sentRecord = localStorage.getItem(`notification_sent_${mealName}`);
    return sentRecord === today;
  };

  const markAsSent = (mealName) => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem(`notification_sent_${mealName}`, today);
  };

  useEffect(() => {
    // Only schedule if permission is granted
    if (permission !== 'granted') return;

    const checkTime = () => {
      const now = new Date();
      const currentHHMM = getHHMM(now);

      // Check each meal time
      Object.entries(mealTimes).forEach(([meal, timeStr]) => {
        if (currentHHMM === timeStr) {
          if (!hasSentToday(meal)) {
            const mealTitle = meal.charAt(0).toUpperCase() + meal.slice(1);
            sendNotification(`Time for ${mealTitle}! 🍽️`, `Don't forget to log your ${meal} in FitTrack to stay on top of your goals.`);
            markAsSent(meal);
          }
        }
      });
    };

    // Check immediately, then every 60 seconds
    checkTime();
    checkIntervalRef.current = setInterval(checkTime, 60000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [permission, mealTimes]);

  return { permission, requestPermission, sendNotification };
}
