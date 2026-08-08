export const DONORS = [
  { id: 1, name: 'Rahim Khan', bloodGroup: 'A+', area: 'Dhanmondi', division: 'Dhaka', totalDonations: 12, available: true, lastDonation: '2026-05-14' },
  { id: 2, name: 'Fatema Begum', bloodGroup: 'O-', area: 'Gulshan', division: 'Dhaka', totalDonations: 8, available: true, lastDonation: '2026-06-02' },
  { id: 3, name: 'Sakib Al Hasan', bloodGroup: 'B+', area: 'Agrabad', division: 'Chittagong', totalDonations: 21, available: false, lastDonation: '2026-07-20' },
  { id: 4, name: 'Nadia Islam', bloodGroup: 'AB+', area: 'Zindabazar', division: 'Sylhet', totalDonations: 5, available: true, lastDonation: '2026-04-11' },
  { id: 5, name: 'Imran Hossain', bloodGroup: 'O+', area: 'Boalia', division: 'Rajshahi', totalDonations: 15, available: true, lastDonation: '2026-06-28' },
  { id: 6, name: 'Sumaiya Akter', bloodGroup: 'A-', area: 'Sonadanga', division: 'Khulna', totalDonations: 3, available: false, lastDonation: '2026-07-30' },
  { id: 7, name: 'Tariq Aziz', bloodGroup: 'B-', area: 'Kotwali', division: 'Barisal', totalDonations: 9, available: true, lastDonation: '2026-05-19' },
  { id: 8, name: 'Mehjabin Chowdhury', bloodGroup: 'AB-', area: 'Rangpur Sadar', division: 'Rangpur', totalDonations: 7, available: true, lastDonation: '2026-06-15' },
  { id: 9, name: 'Arif Mahmud', bloodGroup: 'O+', area: 'Mirpur', division: 'Dhaka', totalDonations: 18, available: true, lastDonation: '2026-07-01' },
  { id: 10, name: 'Rumana Parvin', bloodGroup: 'A+', area: 'Uttara', division: 'Dhaka', totalDonations: 6, available: false, lastDonation: '2026-07-25' },
  { id: 11, name: 'Kamal Uddin', bloodGroup: 'B+', area: 'Halishahar', division: 'Chittagong', totalDonations: 11, available: true, lastDonation: '2026-05-30' },
  { id: 12, name: 'Shirin Sultana', bloodGroup: 'O-', area: 'Ambarkhana', division: 'Sylhet', totalDonations: 14, available: true, lastDonation: '2026-06-10' },
]

export const BLOOD_INVENTORY = [
  { group: 'A+', units: 142, status: 'active' },
  { group: 'A-', units: 28, status: 'suspended' },
  { group: 'B+', units: 176, status: 'active' },
  { group: 'B-', units: 19, status: 'suspended' },
  { group: 'AB+', units: 64, status: 'active' },
  { group: 'AB-', units: 11, status: 'suspended' },
  { group: 'O+', units: 203, status: 'active' },
  { group: 'O-', units: 34, status: 'active' },
]

export const REQUESTS = [
  { id: 'REQ-2081', patient: 'Ayesha Siddiqua', bloodGroup: 'O-', units: 3, hospital: 'Dhaka Medical College', urgency: 'emergency', status: 'matched', date: '2026-08-07' },
  { id: 'REQ-2080', patient: 'Habibur Rahman', bloodGroup: 'B+', units: 2, hospital: 'Square Hospital', urgency: 'urgent', status: 'pending', date: '2026-08-06' },
  { id: 'REQ-2079', patient: 'Lima Khatun', bloodGroup: 'A+', units: 1, hospital: 'Chittagong Medical', urgency: 'normal', status: 'fulfilled', date: '2026-08-05' },
  { id: 'REQ-2078', patient: 'Sohel Rana', bloodGroup: 'AB+', units: 4, hospital: 'Sylhet MAG Osmani', urgency: 'emergency', status: 'matched', date: '2026-08-05' },
  { id: 'REQ-2077', patient: 'Nusaiba Haque', bloodGroup: 'O+', units: 2, hospital: 'United Hospital', urgency: 'urgent', status: 'pending', date: '2026-08-04' },
  { id: 'REQ-2076', patient: 'Jahangir Alam', bloodGroup: 'B-', units: 1, hospital: 'Rajshahi Medical', urgency: 'normal', status: 'fulfilled', date: '2026-08-03' },
]

export const DONATION_HISTORY = [
  { id: 'D-501', date: '2026-05-14', hospital: 'Dhaka Medical College', type: 'Whole Blood', units: 1, status: 'completed' },
  { id: 'D-478', date: '2026-01-22', hospital: 'BIRDEM Hospital', type: 'Platelets', units: 1, status: 'completed' },
  { id: 'D-455', date: '2025-09-30', hospital: 'Square Hospital', type: 'Whole Blood', units: 1, status: 'completed' },
  { id: 'D-431', date: '2025-06-08', hospital: 'Red Crescent, Dhaka', type: 'Plasma', units: 1, status: 'completed' },
  { id: 'D-410', date: '2025-02-17', hospital: 'Dhaka Medical College', type: 'Whole Blood', units: 1, status: 'completed' },
]

export const CAMPS = [
  { id: 1, name: 'Dhaka University Blood Drive', org: 'Badhan DU Unit', date: '2026-08-18', area: 'TSC, Dhaka University', division: 'Dhaka', slots: 120, registered: 87 },
  { id: 2, name: 'Corporate Donation Camp', org: 'BRAC Foundation', date: '2026-08-24', area: 'Mohakhali, Dhaka', division: 'Dhaka', slots: 80, registered: 42 },
  { id: 3, name: 'Chittagong Port Camp', org: 'Sandhani CMC', date: '2026-09-02', area: 'Agrabad, Chittagong', division: 'Chittagong', slots: 100, registered: 65 },
  { id: 4, name: 'Sylhet Community Drive', org: 'Red Crescent Sylhet', date: '2026-09-09', area: 'Zindabazar, Sylhet', division: 'Sylhet', slots: 60, registered: 31 },
]

export const BLOG_POSTS = [
  { id: 1, title: 'Why O-negative blood is the universal lifeline', excerpt: 'O-negative donors are needed in every emergency room. Here is why your donation matters more than you think.', author: 'Dr. Farhana Kabir', date: '2026-07-28', readTime: '5 min', tag: 'Awareness', image: 'photo-1615461066841-6116e61058f4' },
  { id: 2, title: 'What to eat before and after donating blood', excerpt: 'Iron-rich meals, hydration, and rest — a practical guide for first-time and regular donors in Bangladesh.', author: 'Nutritionist Rita Das', date: '2026-07-15', readTime: '4 min', tag: 'Health', image: 'photo-1490645935967-10de6ba17061' },
  { id: 3, title: 'How BloodConnect matched 12,000 patients last year', excerpt: 'A look behind our donor-matching network and the volunteers who keep it running around the clock.', author: 'BloodConnect Team', date: '2026-06-30', readTime: '6 min', tag: 'Community', image: 'photo-1579154204601-01588f351e67' },
  { id: 4, title: 'Debunking 7 common myths about blood donation', excerpt: 'No, donating blood does not make you weak. We separate fact from fiction with medical experts.', author: 'Dr. Imtiaz Chowdhury', date: '2026-06-12', readTime: '5 min', tag: 'Awareness', image: 'photo-1554734867-bf3c00a49371' },
]

export const MONTHLY_DONATIONS = [
  { month: 'Feb', count: 320 },
  { month: 'Mar', count: 412 },
  { month: 'Apr', count: 388 },
  { month: 'May', count: 465 },
  { month: 'Jun', count: 521 },
  { month: 'Jul', count: 498 },
  { month: 'Aug', count: 576 },
]

export const NOTIFICATIONS = [
  { id: 1, title: 'Urgent O- request near you', body: 'Dhaka Medical College needs 3 units of O- within 6 hours.', time: '12 min ago', type: 'emergency', unread: true },
  { id: 2, title: 'Donation eligibility restored', body: 'You are now eligible to donate again. Thank you for waiting!', time: '2 hours ago', type: 'info', unread: true },
  { id: 3, title: 'Camp registration confirmed', body: 'You are registered for the DU Blood Drive on Aug 18.', time: 'Yesterday', type: 'success', unread: false },
  { id: 4, title: 'New certificate available', body: 'Your 12th donation certificate is ready to download.', time: '3 days ago', type: 'success', unread: false },
]
