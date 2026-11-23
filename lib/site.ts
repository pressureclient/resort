// Everything brand-specific lives here. Change these to rebrand the whole site.
export const site = {
  name: 'Marisol Cove',
  fullName: 'Marisol Cove Beach Resort',
  tagline: 'Beachfront stays on a quiet bay',
  email: 'stay@marisolcove.example',
  phone: '+234 800 000 0000',
  address: 'Cove Road, Sample Coast',
  // Sample location for the map. Replace with the resort's real coordinates.
  mapQuery: '6.4281,3.4219',
  currency: 'NGN',
  locale: 'en-NG',
  checkIn: '2:00 PM',
  checkOut: '12:00 PM',
  socials: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
  },
};

export const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=14&output=embed`;
export const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`;
