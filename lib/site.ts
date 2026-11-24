// Everything brand-specific lives here.
export const site = {
  name: 'La Luz',
  fullName: 'La Luz Beach Resort',
  tagline: 'No.1 Beach Front in Laiya Batangas',
  footerLine: 'A beachfront retreat on the shores of Laiya, where the rain forest meets the sea.',
  email: 'support@laluzbeachandresort.com',
  phone: '+63 (934) 717 4970',
  address: 'Laiya-Aplaya San Juan, Batangas, Philippines',
  mapQuery: 'Laiya-Aplaya San Juan, Batangas, Philippines',
  directions: 'https://maps.app.goo.gl/dcjVdj98PGh55pGs5',
  currency: 'PHP',
  locale: 'en-PH',
  timeZone: 'Asia/Manila',
  checkIn: '2:00 PM',
  checkOut: '12:00 PM',
  logo: '/images/branding/yeGRrfJEk3FJVdrrj9WHrZuE08UDjUT7Y0Vp05Hv.png',
};

export const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=14&output=embed`;
export const mapLink = site.directions;
