export const CATEGORIES = [
  'D-Tan', 'Bleach', 'Basic Facials', 'Advanced Facials',
  'Premium Facials', 'Hair Care', 'Pedicure & Manicure', 'Waxing',
];

export const ICON = {
  'D-Tan': 'sun', 'Bleach': 'drop', 'Basic Facials': 'face', 'Advanced Facials': 'gem',
  'Premium Facials': 'crown', 'Hair Care': 'scissors', 'Pedicure & Manicure': 'bottle', 'Waxing': 'leaf',
};

export const PARLOUR = {
  name: 'Spark Beauty Parlour',
  phone: import.meta.env.VITE_PARLOUR_PHONE || '+918500512643',
  address: ['STV Nagar, Kothailu', 'Back side of Gangamma Temple'],
  maps: 'https://www.google.com/maps/search/?api=1&query=STV+Nagar+Kothailu+Gangamma+Temple',
};

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
