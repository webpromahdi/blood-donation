export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const BANGLADESH_DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Sylhet',
  'Khulna',
  'Barisal',
  'Rangpur',
  'Mymensingh',
]

export const BLOOD_GROUP_COLORS = {
  'A+': 'red',
  'A-': 'red',
  'B+': 'blue',
  'B-': 'blue',
  'AB+': 'purple',
  'AB-': 'purple',
  'O+': 'green',
  'O-': 'green',
}

export const URGENCY_LEVELS = {
  emergency: { label: 'Emergency', color: 'red' },
  urgent: { label: 'Urgent', color: 'orange' },
  normal: { label: 'Normal', color: 'green' },
}

export const STATUS_COLORS = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  completed: 'green',
  cancelled: 'gray',
  active: 'green',
  suspended: 'red',
  matched: 'blue',
  fulfilled: 'green',
}

export const DEMO_CREDENTIALS = {
  donor: { email: 'donor@demo.com', password: 'demo123', role: 'donor' },
  admin: { email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  hospital: { email: 'hospital@demo.com', password: 'hosp123', role: 'hospital' },
  seeker: { email: 'seeker@demo.com', password: 'seek123', role: 'seeker' },
}

export const DONATION_TYPES = ['Whole Blood', 'Platelets', 'Plasma', 'Double Red Cells']
