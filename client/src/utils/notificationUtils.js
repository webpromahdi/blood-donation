export const getNotificationRoute = (notification, role) => {
  const { type, relatedType, relatedId } = notification;

  // Global Chat Routing
  if (relatedType === 'chat_message') {
    return `/${role}/chat`;
  }

  // Routing based on user role and notification type
  switch (role) {
    case 'admin':
      if (relatedType === 'user') {
        if (notification.title.toLowerCase().includes('hospital')) return '/admin/hospitals';
        if (notification.title.toLowerCase().includes('donor')) return '/admin/donors';
      }
      if (relatedType === 'request') return '/admin/requests';
      if (relatedType === 'voluntary_donation') return '/admin/voluntary';
      if (relatedType === 'donation') return '/admin/requests'; // Can view donation via request
      break;

    case 'hospital':
      if (relatedType === 'request') return '/hospital/requests';
      if (relatedType === 'donation') return '/hospital/requests'; // View within request details
      if (relatedType === 'voluntary_donation') return '/hospital/appointments';
      if (relatedType === 'appointment') return '/hospital/appointments';
      break;

    case 'donor':
      if (relatedType === 'request') return '/donor/dashboard'; // Matching requests are usually in dashboard
      if (relatedType === 'donation') return '/donor/history';
      if (relatedType === 'appointment') return '/donor/history';
      if (relatedType === 'voluntary_donation') return '/donor/voluntary';
      if (relatedType === 'certificate') return '/donor/certificates';
      break;

    case 'seeker':
      if (relatedType === 'request') return '/seeker/tracking';
      break;

    default:
      break;
  }

  // Default fallback
  return `/${role}/notifications`;
};
