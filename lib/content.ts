// La Luz Beach Resort content, taken from laluzbeachandresort.com.
// Room slugs, prices and capacity mirror the rooms table in Supabase (supabase/schema.sql).
// The booking system always uses the database for price and availability.

// Photos are served from La Luz's current site. Before that site is switched off,
// copy them into /public and point these paths there (see README).
const S = (path: string) => `https://laluzbeachandresort.com/storage/${path}`;
const RT = (file: string) => S(`room-types/gallery/${file}`);

export const images = {
  heroSlides: [
    S('cms/images/gbPI1nRNbkUSnDYoECHGRO6nHVY0Jj4SBBaQGMjb.webp'),
    S('cms/images/4NvKxPu3Jj7eG7Rb0HJKOIE3xgStafVxwyxu96sx.webp'),
    S('cms/images/QmBFMo7yu51AsjFBIovwvucLfq7AjuUkb9uQ98jG.webp'),
    S('cms/images/5GdvFLwxh7jeINpnXZEt7Bcvqvor0VZftFcWiOHo.webp'),
  ],
  about: S('cms/images/S5X8JdSJrLiPFoqpHxcvC7ND5I0EQXNxROGqqsv8.webp'),
  aboutPage: S('cms/images/kGhO8MoL46ox0r0pbuNGOY3X4Ww962L1IusI7VAX.webp'),
  rooms: S('cms/images/Y25oKde3lzgvPKUVsS7Qfiyd2HbQ4xHOB3eYIRu8.webp'),
  pool: S('cms/images/Dwiuh7V8DjWbtaNm0HNIZ0y1nug1NvHhz6XjqKTQ.webp'),
  contact: S('cms/images/Zu3Cj7mVh4gDDnxOBswI3JU8uNjylfpSDNlSOmZF.webp'),
  dining: S('gallery/Gv2CTebRtYQcfTfvjFd8mxOdZusQVUNeZ2iYZ7P4.jpg'),
  activities: S('gallery/SB3v2IqrPvQj7EJveACnKXToz065pbQImOmvk0Au.jpg'),
  activities2: S('gallery/04rmHDPaP0h1bI6Uw4cPNhiGMwUPfmvSlyG3T9la.jpg'),
};

export type Room = {
  slug: string;
  type: string;
  name: string;
  price: number;
  weekendPrice?: number;
  capacity: number;
  beds: string;
  size: number;
  summary: string;
  description: string;
  featured?: boolean;
  images: string[];
};

// Kept to amenities every room clearly has. The old site listed a private pool,
// jacuzzi and pets for every room, which the FAQ contradicts.
export const roomAmenities = ['Free Wi-Fi', 'Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Beach access', 'Daily housekeeping'];

export const rooms: Room[] = [
  {
    slug: 'deluxe-room', type: 'Premier', name: 'Premier Room', price: 4160, capacity: 3, beds: 'Double king bed size', size: 35, featured: true,
    summary: 'A comfortable and spacious premier room perfect for small groups.',
    description: 'A comfortable and spacious premier room perfect for small groups. Features a double king bed size with modern amenities and a relaxing beach resort atmosphere.',
    images: [RT('LBqCfZC1FQcTBEfz5Zy5fsWbpYOOsVVOlXznavDW.webp'), RT('iLhkYzX249Sb1g9V6fBUm3JDYeebMrNkcPG7i2w9.webp')],
  },
  {
    slug: 'beach-view-room', type: 'Annex', name: 'Annex', price: 3220, capacity: 5, beds: '1 king bed size', size: 27, featured: true,
    summary: 'A cozy and comfortable annex room for couples or small groups.',
    description: 'A cozy and comfortable annex room for couples or small groups. Features 1 king bed in a well-maintained private space with easy access to the resort facilities.',
    images: [RT('nnWxpbZFjrTATCeTX0OpATTYJnMBcXSBUIlAWl9H.jpg'), RT('bLLjp9AXWsozSeyWWIeDAEn4qIZcIixr12sO8i4Z.png')],
  },
  {
    slug: 'family-suite', type: 'Deluxe', name: 'Annex Deluxe', price: 5340, capacity: 4, beds: '2 king bed size', size: 24, featured: true,
    summary: 'A deluxe annex room with 2 king beds size for up to 4 guests.',
    description: 'A deluxe annex room with 2 king beds for up to 4 guests. Upgraded from the standard annex with better finishes and more comfortable amenities.',
    images: [RT('OGVyD8Li2jl47ZdFHIwVUABHMnXSCZe05etXM97G.jpg'), RT('XZphdQ9KoPXxqC6Cw5wZdvn5EAlqOtAAercykvM0.png')],
  },
  {
    slug: 'beachfront-villa', type: 'Deluxe', name: 'Premier Deluxe', price: 6150, capacity: 5, beds: '2 king bed size and 1 single bed', size: 45,
    summary: 'A deluxe premier room for up to 5 guests featuring 2 king bed size and 1 single bed.',
    description: 'A deluxe premier room for up to 5 guests featuring 2 king beds and 1 single bed. Upgraded amenities and finishes make this one of the most comfortable rooms in the resort.',
    images: [RT('tllFzUcoMApYNZu5hHWpsLc54JHg1n2v1Qoogaf6.jpg'), RT('A7tUNdMqUKP7rNlK9f5WAwqTUDhtucpaQvPptVs3.png')],
  },
  {
    slug: 'presidential-suite', type: 'Dormitory', name: 'Annex Dorm', price: 7150, capacity: 6, beds: '3 king beds', size: 50,
    summary: 'A dormitory-style annex room with 3 king beds for up to 6 guests.',
    description: 'A dormitory-style annex room with 3 king beds for up to 6 guests. A good fit for families and barkada trips who want to stay together.',
    images: [RT('nYpx2yMU91iidyi3tGySBm4BvRbI8PFRfYdVcta4.png'), RT('MZx5eyvQkzb9dal2Tu6jAtSIMvn4v5imVcwS0Sdj.jpg')],
  },
  {
    slug: 'annex-loft-room', type: 'Loft', name: 'Annex Loft Room', price: 8340, weekendPrice: 8349, capacity: 8, beds: '4 king beds', size: 65,
    summary: 'A two-level annex loft room that fits up to 7-8 guests comfortably.',
    description: 'A two-level annex loft room that fits up to 7-8 guests comfortably. Features 4 king beds spread across both levels. Great for barkada trips and family reunions.',
    images: [RT('eSNP5ZDXStVaVlLwfUpAZWicjcFzhR58G0LDnZPe.jpg'), RT('9KRre2ZKUKaLdLCfgWhBO6qowOx17ueAIYZLqFz1.jpg'), RT('sNbMrrtBDm6M2ph5mgOfPgAJdOAaGnuMTsTJg5tb.jpg')],
  },
  {
    slug: 'premier-loft-room', type: 'Loft', name: 'Premier Loft Room', price: 10350, capacity: 12, beds: '6 king sized beds', size: 75,
    summary: 'A spacious loft room ideal for families or groups of up to 10-12.',
    description: 'A spacious loft room ideal for families or groups of up to 10-12. Features 6 king sized beds across two levels. Perfect for a fun group getaway by the beach.',
    images: [RT('ijPf9Ja6U2kbnFe4ury2AJw6PeyPmfiQ7qanQvfh.jpg'), RT('z8fcji8wYd2OP3awWr6sZJU2kvwsMLtHmDHj68V0.jpg'), RT('VID0It2SpLIwcIYSJztz0vgJk0FqMnG1vOzRoM8W.jpg')],
  },
  {
    slug: 'dormitory-room', type: 'Dormitory', name: 'Dormitory Room', price: 12680, capacity: 20, beds: '8 king bed size', size: 100,
    summary: 'A large dormitory room for big groups, team outings and budget group travel.',
    description: 'A large dormitory room for big groups. Perfect for team outings, school trips or budget group travel.',
    images: [RT('Jsfxk9Mlp2m9X7kUJqveWKzpDOtWZysu6J97aNKQ.jpg'), RT('5S2ZyAjCtvFaBr9rSGOth0SSkezHNcX6I0LZ0PLT.jpg'), RT('EQw7mRRscOKr3iyIsfJNODntWDsOgrinS8gyGMCZ.jpg'), RT('a5V3dmbhFUd7MWQPrC3HDcvnqtKwyYuLPHqRbJdJ.jpg'), RT('7GxUFkpFjqluzm3O5390sfbXIXJCkXihMrsPrGAg.jpg')],
  },
  {
    slug: 'la-luz-luxury-5br-private-villa', type: 'Villa', name: 'La Luz Luxury 5BR Private Villa', price: 15270, capacity: 25, beds: '5 bedrooms', size: 250,
    summary: 'An expansive 5-bedroom luxury villa ideal for large groups and special events.',
    description: 'An expansive 5-bedroom luxury villa ideal for large groups and special events. Features premium furnishings, multiple bedrooms, a full kitchen, and exclusive resort amenities.',
    images: [RT('7R4K4CBM3VfaJ8pU7xUjGbpD8i1BrjIrKAdpm8wu.jpg'), RT('y9ryvkqPliS7NCpY4rrSreAnF6M3OmnwZVtJZANP.png'), RT('9qe5EzHMpqY85gDruiwVFJaUyq6h2zCfoOuwwHjR.jpg'), RT('WkhpByLPxyiZzUhzZ1PrJ1hTgxiyCBJHCFySnrLZ.jpg'), RT('O5IrHU5cFlsMsOSQhrnoTjbQpM4nCvVgFdA1a6IE.jpg')],
  },
];

export const activities = [
  { id: 'jet-ski', name: 'Jet Ski', blurb: 'Race across the waves on our high-powered jet skis. Available for both beginners and experienced riders with full safety gear.', price: 800, duration: '2 hours', image: S('activities/7qV8P7A23OeSQR0tHabtud9RDLhQR2d1R7z06iej.png') },
  { id: 'banana-boat', name: 'Banana Boat', blurb: 'Hold on tight for a thrilling banana boat ride along the coast. Perfect for groups wanting a fun, adrenaline-pumping experience.', price: 1500, duration: 'Full day', image: S('activities/bXPh9UqGhqIIEGA2gnGKirvcEJrUVAmNNH425sR1.png') },
  { id: 'kayaking', name: 'Kayaking', blurb: 'Paddle along the coastline at your own pace. Single and tandem kayaks available. Explore coves and the marine sanctuary.', price: 400, duration: '1 hour', image: S('activities/AARKnw0Q4tAmdKtZsqvipmFb7BPlcHKm1BOIxYHk.png') },
  { id: 'snorkeling', name: 'Snorkeling', blurb: 'Discover the rich marine life in the adjacent sanctuary. Equipment provided. Guided tours available for deeper areas.', price: 0, duration: 'Open hours', image: S('activities/F4BnK4aOOuCmCuFxcood55zUHF4tz3pYPPaUzmRo.png') },
  { id: 'flying-fish', name: 'Flying Fish', blurb: 'Feel like you are flying above the sea. An exhilarating ride that lifts you just above the waves for a thrilling view of the coastline.', price: 1200, duration: '2 hours', image: S('activities/Han3YtssXGMU4GUZjlnojun4HCFgYaeC4ZWZvOz5.png') },
  { id: 'beach-volleyball', name: 'Beach Volleyball', blurb: 'Challenge your group on our beachfront court. Balls and nets are set up daily, ready for pickup games.', price: 900, duration: '60-90 min', image: S('activities/VpUJigwsbgwyOfDLH9B7sLRxYxkBGO8rzN3UBGae.png'), pageOnly: true },
  { id: 'bonfire-night', name: 'Bonfire Night', blurb: 'An evening around the fire on the beach. Ask the front desk for times and what is included.', price: 2500, duration: 'Half day', image: S('activities/cJRZtcV1DuCFzF8xnXCl7CE7K8pw2irzfVtxht0c.png'), pageOnly: true },
];

export const highlights = [
  { icon: 'wifi', title: 'Free Wi-Fi', text: 'Stay connected across the resort.' },
  { icon: 'beach', title: 'Private Beach', text: 'Calm, clear water right in front of the resort.' },
  { icon: 'wave', title: 'Water Activities', text: 'Snorkeling, kayaking, jet ski and more.' },
  { icon: 'sun', title: 'Day Tour', text: 'Spend the day with us, no overnight needed.' },
] as const;

export const dining = [
  {
    name: 'The Reef', kind: 'Filipino-International', hours: '6:30 AM – 10:30 PM', seats: 120,
    short: 'Fresh seafood, international dishes and local specialties with a view of the bay.',
    text: 'The Reef offers a delightful dining experience with a sweeping view of the beach, bay and surrounding hills. The menu features fresh seafood, international cuisine and local specialties. Casual attire. Lunch and dinner are served, and breakfast runs from 7:30 AM until 10 AM, with a breakfast buffet most days (check with The Reef staff or the front desk). Room service is available from the full Reef menu, and specialty dining can be arranged for groups.',
    image: S('restaurants/p3kZCuko3kAjBI0TRyTCnlsJ6TNURpKSf0V0nBWZ.png'),
  },
  {
    name: 'The Sandbar', kind: 'Filipino Seafood', hours: '7:30 AM – 10:00 PM', seats: 80,
    short: 'Beachside grill with your toes in the sand and live music on weekends.',
    text: 'Casual beachside dining with your toes in the sand. Fresh seafood grilled to perfection, tropical cocktails and sunset views. The heart of resort social life, with live music on weekends.',
    image: S('restaurants/bYDJomwKE0x5tHSRdgMVxWU2vlXVRCJpx1YAfU97.png'),
  },
  {
    name: 'Sunset Lounge & Bar', kind: 'Bar & Tapas', hours: '3:00 PM – 12:00 AM', seats: 50,
    short: 'Craft cocktails, premium spirits and light bites at sunset.',
    text: 'The perfect spot to unwind with craft cocktails, premium spirits and light bites, with wide views of the bay that are at their best at sunset.',
    image: S('restaurants/QDWCoR7e2OYSRqGcuWNPGEb5JjrApAsh4FfPYCN6.png'),
  },
  {
    name: 'Camayan Mart', kind: 'Resort store', hours: '7:30 AM – 10:00 PM', seats: null,
    short: 'Snacks, drinks and holiday essentials, steps from the beach.',
    text: 'A fully stocked little store literally steps from the beach. Shop for food, drinks and everything you need or want during your stay.',
    image: S('restaurants/yxnlVc5YjAhceJfPB2S2YqEn0BAbzl7cuedTYNLf.png'),
  },
  {
    name: 'Pizzaro', kind: 'Pizza', hours: null, seats: null,
    short: 'Pizza to share by the pool or on the beach.',
    text: 'Pizza to share by the pool or on the beach.',
    image: S('restaurants/A8VxFVArl68Gy5PbUJAjbug0pVAuDOl8ohIuvVJR.png'),
  },
];

// Testimonials as they appear on the current La Luz site.
export const reviews = [
  { name: 'Doe', room: 'Annex Deluxe', date: 'Jun 2026', text: 'A perfect getaway spot! Very serene, secure, and well-organized. I loved the pool and the overall atmosphere.' },
  { name: 'Mary', room: 'Premier Room', date: 'Jun 2026', text: 'Absolutely amazing experience! The environment is so clean and peaceful. The staff were very welcoming and professional. I enjoyed every moment and will definitely visit again.' },
  { name: 'Jessica', room: 'Premier Deluxe', date: 'Jun 2026', text: 'La Luz Resort is pure luxury! The beachfront view is breathtaking, and the rooms are elegant and spotless. Truly a world-class experience.' },
];

export const about = {
  story: [
    'La Luz Beach Resort sits on a property that has been privately owned for over 30 years. It was recently opened to the public after decades as a hideaway for a family of 13 children, hence the many rooms and a large pavilion.',
    'Nestled along the shores of Laiya, San Juan, Batangas, the resort has grown into one of the province’s most trusted beachfront destinations. What began as a modest family compound now offers genuine coastal hospitality to guests from all over the Philippines.',
    'We focus on maintaining the natural environment: the towering trees, the white coral sand, the rocky cove on one side. No gimmicks, no overcrowding. Just a well-kept resort that delivers on its promise of a peaceful seaside retreat.',
  ],
  values: [
    { title: 'Natural Environment', text: 'We preserve the lush greenery and existing trees that have grown on this property for decades. The resort lives within nature, not over it.' },
    { title: 'Peaceful Experience', text: 'No loud music past 10 PM. No overcrowding. We limit guest capacity so everyone gets the space and silence they came for.' },
    { title: 'Personalized Hospitality', text: 'Our staff knows returning guests by name. From arranging birthday surprises to accommodating dietary needs, every detail matters.' },
  ],
  stats: [
    { v: '30+', k: 'Years of family heritage' },
    { v: '50K+', k: 'Happy guests' },
    { v: '22', k: 'Rooms & villas' },
    { v: '4.9', k: 'Average rating' },
  ],
  photos: [
    S('gallery/TAKVDdkmuaJ1mfqeaecA5G6lfqbHuQJFR1LrtDdW.png'),
    S('gallery/MiHKsWVCm4h5eWWOh4K6z2wVSc8wSKK1k1ptcJ1y.png'),
    S('gallery/nuTSQk3PIw37HVGIVrpNkwUwzSJPkzQdGA6Cm1E5.png'),
    S('gallery/AwglCnd9aSe8U8S8JgUbbaZJLxGXbk5dvPvaQl0K.png'),
  ],
};

export const gallery = [
  S('gallery/dOTj02AovCkZUIJhuUW91vUIlxtZiWI4bYQqawHm.png'),
  S('gallery/3qPBYhAfx6GJRYryZdkYEBfpzS2IDRxAUPivCpFa.png'),
  S('gallery/mnWiSByzqwhpr5McuQQ4sv4JxQ8c2Z7jlWKzsjo0.png'),
  S('gallery/G4Rfep19rq9kbSgGx76EBtsZns7FnFqN72QJIE6T.png'),
  S('gallery/1vc7vsLUCIdqKb2RdysJ92VrvQOmk7p5Tm4VBVUt.png'),
  S('gallery/4dadAMJ4NSNVDp8bDSN5xMmiYeBMLWMmwat8MBwo.png'),
  S('gallery/AwglCnd9aSe8U8S8JgUbbaZJLxGXbk5dvPvaQl0K.png'),
  S('gallery/nuTSQk3PIw37HVGIVrpNkwUwzSJPkzQdGA6Cm1E5.png'),
  S('gallery/MiHKsWVCm4h5eWWOh4K6z2wVSc8wSKK1k1ptcJ1y.png'),
  S('gallery/TAKVDdkmuaJ1mfqeaecA5G6lfqbHuQJFR1LrtDdW.png'),
];

export const arrival = [
  'Check-in time is 2:00 PM, check-out time is 12:00 PM.',
  'A valid government-issued ID is required upon registration.',
  'Please present your booking number at the front desk.',
  'Outside food and drinks may be subject to a corkage fee.',
];

export const faqs = [
  { group: 'Booking', q: 'What time is check-in and check-out?', a: 'Standard check-in is at 2:00 PM and check-out is at 12:00 PM noon. Early check-in or late check-out may be arranged subject to availability and may incur additional charges. Please contact us in advance.' },
  { group: 'Booking', q: 'What is your cancellation policy?', a: 'Cancellations made 7 or more days before check-in receive a full refund. Cancellations 3-6 days before check-in forfeit 50% of the total. Cancellations within 72 hours or no-shows forfeit the full amount. Peak season dates have a 14-day cancellation policy.' },
  { group: 'Booking', q: 'How do I make a group or event booking?', a: 'For group bookings of 5 rooms or more, corporate events, weddings or private functions, please email support@laluzbeachandresort.com or call +63 (934) 717 4970. We offer tailored packages and special group rates.' },
  { group: 'Services', q: 'Do you offer airport transfers?', a: 'Yes. Please contact our team at least 48 hours before arrival to arrange this service. Rates vary by pick-up location.' },
  { group: 'Services', q: 'Do you have facilities for children?', a: 'Absolutely! We welcome families. Baby cots and high chairs are available on request. Ask our team about activities for kids during your stay.' },
  { group: 'Dining', q: 'Is breakfast included in the room rate?', a: 'Breakfast is not automatically included in standard room rates. We offer bed-and-breakfast packages that can be added at the time of booking or upon arrival.' },
  { group: 'General', q: 'Are pets allowed at the resort?', a: 'We love animals, but for the comfort and safety of all our guests, pets are not permitted within the resort premises. We apologize for any inconvenience.' },
  { group: 'General', q: 'Is the beach private?', a: 'Yes. Our beachfront is private and exclusive to resort guests, and it is maintained daily for your enjoyment.' },
];
