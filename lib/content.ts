// Marketing content. Room slugs, prices and capacity mirror supabase/schema.sql.
// The booking system always uses the database as the source of truth for price and availability.

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const images = {
  hero: u('1507525428034-b723cf961d3e', 2200),
  about: u('1540541338287-41700207dee6'),
  pool: u('1566073771259-6a8506099945'),
  location: u('1519046904884-53103b34b206'),
};

export type Room = {
  slug: string;
  name: string;
  price: number;
  capacity: number;
  beds: string;
  size: number;
  summary: string;
  description: string;
  amenities: string[];
  images: string[];
};

export const rooms: Room[] = [
  {
    slug: 'shoreline-room',
    name: 'Shoreline Room',
    price: 95000,
    capacity: 3,
    beds: '1 king + 1 day bed',
    size: 35,
    summary: 'Sea-facing room a few steps from the sand, with a private balcony.',
    description:
      'Wake up to the sound of the water. The Shoreline Room sits on the first row facing the bay, with a balcony wide enough for two chairs and morning coffee. Linen bedding, a rain shower and blackout curtains for slow mornings.',
    amenities: ['Sea view balcony', 'Air conditioning', 'Rain shower', 'Smart TV', 'Mini fridge', 'Free Wi-Fi'],
    images: [u('1582719478250-c89cae4dc85b'), u('1590490360182-c33d57733427'), u('1507525428034-b723cf961d3e')],
  },
  {
    slug: 'garden-annex',
    name: 'Garden Annex',
    price: 70000,
    capacity: 5,
    beds: '2 queens + 1 single',
    size: 30,
    summary: 'Ground-floor room set in the palm garden, a short walk to the beach.',
    description:
      'Built for groups and families who spend the day outside. The Garden Annex opens straight onto the palm garden, two minutes from the beach and the pool, with room for five and a shaded porch for drying off.',
    amenities: ['Garden porch', 'Air conditioning', 'Sleeps 5', 'Hot shower', 'Free Wi-Fi', 'Daily housekeeping'],
    images: [u('1611892440504-42a792e24d32'), u('1631049307264-da0ec9d70304'), u('1540541338287-41700207dee6')],
  },
  {
    slug: 'cove-suite',
    name: 'Cove Suite',
    price: 140000,
    capacity: 4,
    beds: '1 king + sofa bed',
    size: 48,
    summary: 'Corner suite with a lounge, outdoor shower and the widest view of the bay.',
    description:
      'Our corner suite looks across the whole bay. A separate lounge, an outdoor stone shower and a deep tub make it the room people book for anniversaries and long weekends.',
    amenities: ['Panoramic bay view', 'Separate lounge', 'Outdoor shower', 'Bathtub', 'Nespresso machine', 'Free Wi-Fi'],
    images: [u('1578683010236-d716f9a3f461'), u('1590490360182-c33d57733427'), u('1520250497591-112f2f40a3f4')],
  },
  {
    slug: 'family-villa',
    name: 'Family Villa',
    price: 180000,
    capacity: 6,
    beds: '1 king + 2 queens',
    size: 72,
    summary: 'Two-bedroom villa with a kitchenette and a shaded deck for long afternoons.',
    description:
      'Two bedrooms, a kitchenette and a private deck under the palms. The villa gives a family or a group of friends their own corner of the resort while staying close to the beach, pool and restaurants.',
    amenities: ['Two bedrooms', 'Kitchenette', 'Private deck', 'Sleeps 6', 'Air conditioning', 'Free Wi-Fi'],
    images: [u('1571896349842-33c89424de2d'), u('1611892440504-42a792e24d32'), u('1566073771259-6a8506099945')],
  },
];

export const activities = [
  {
    id: 'jet-ski',
    name: 'Jet ski',
    blurb: 'Thirty minutes across the open bay with a short safety briefing first.',
    detail: 'From 18 years. Life jackets provided. Weather permitting.',
    image: u('1626447857058-2ba6a8868cb5', 900),
  },
  {
    id: 'banana-boat',
    name: 'Banana boat',
    blurb: 'The group favourite. Up to six riders towed along the shoreline.',
    detail: 'From 8 years with an adult. About 15 minutes per ride.',
    image: u('1530053969600-caed2596d242', 900),
  },
  {
    id: 'kayaking',
    name: 'Kayaking',
    blurb: 'Single and double kayaks to paddle out to the rocks at the edge of the cove.',
    detail: 'Hourly rental. Calm mornings are best.',
    image: u('1472745942893-4b9f730c7668', 900),
  },
  {
    id: 'snorkelling',
    name: 'Snorkelling',
    blurb: 'Clear shallow water by the reef with masks, fins and a guide.',
    detail: 'Guided sessions at 9 AM and 3 PM.',
    image: u('1544551763-46a013bb70d5', 900),
  },
  {
    id: 'paddleboarding',
    name: 'Paddleboarding',
    blurb: 'Stand-up boards for flat-water days, with a lesson for first-timers.',
    detail: 'Hourly rental. Lesson included on first rent.',
    image: u('1519046904884-53103b34b206', 900),
  },
];

export const highlights = [
  { icon: 'wifi', title: 'Free Wi-Fi', text: 'Fast connection in every room and across the beach bar.' },
  { icon: 'beach', title: 'Private beach', text: 'A quiet stretch of sand kept for resort guests.' },
  { icon: 'wave', title: 'Water activities', text: 'Jet ski, kayaks, snorkelling and more from our own jetty.' },
  { icon: 'sun', title: 'Day tour', text: 'Not staying over? Book a day pass with pool and beach access.' },
] as const;

export const dining = [
  { name: 'Driftwood Grill', kind: 'Restaurant', text: 'Grilled catch of the day, suya platters and slow-cooked stews.', hours: '7 AM to 10 PM', image: u('1414235077428-338989a2e8c0', 900) },
  { name: 'The Tide Bar', kind: 'Beach bar', text: 'Cocktails, cold drinks and small plates with your feet in the sand.', hours: '11 AM to midnight', image: u('1514933651103-005eec06c04b', 900) },
  { name: 'Lantern Deck', kind: 'Sunset lounge', text: 'The best seat for sunset, with live music on weekends.', hours: '4 PM to 11 PM', image: u('1517248135467-4c7edcad34c4', 900) },
  { name: 'Ember Pizza', kind: 'Wood-fired pizza', text: 'Wood-fired pizzas to share by the pool or take to your room.', hours: '12 PM to 10 PM', image: u('1565299624946-b28f40a0ae38', 900) },
  { name: 'Cove Pantry', kind: 'Mini mart', text: 'Snacks, sunscreen, drinks and the things you forgot to pack.', hours: '7 AM to 9 PM', image: u('1559339352-11d035aa65de', 900) },
];

export const menu = [
  {
    section: 'Breakfast',
    items: [
      { name: 'Cove breakfast', desc: 'Eggs your way, plantain, toast, fruit and coffee', price: 9500 },
      { name: 'Yam and egg sauce', desc: 'Boiled yam, tomato egg sauce, fresh pepper', price: 7000 },
      { name: 'Pancake stack', desc: 'Honey, banana and toasted coconut', price: 6500 },
    ],
  },
  {
    section: 'From the grill',
    items: [
      { name: 'Catch of the day', desc: 'Whole grilled fish, chips or fried yam, pepper sauce', price: 18000 },
      { name: 'Suya platter', desc: 'Beef and chicken suya, onions, tomato, spice', price: 12500 },
      { name: 'Grilled prawns', desc: 'Garlic butter, lime, jollof rice', price: 21000 },
    ],
  },
  {
    section: 'Drinks',
    items: [
      { name: 'Chapman', desc: 'The classic, built tall over ice', price: 4000 },
      { name: 'Fresh coconut', desc: 'Opened at the bar', price: 3000 },
      { name: 'House cocktail', desc: 'Ask the bar for today’s mix', price: 6500 },
    ],
  },
];

// Sample reviews for the template. Replace with real guest reviews before launch.
export const reviews = [
  { name: 'Adaeze O.', room: 'Cove Suite', date: 'Sample review', text: 'We came for two nights and stayed four. The suite view in the morning is worth the trip by itself, and the staff remembered our names by day two.' },
  { name: 'Tunde B.', room: 'Garden Annex', date: 'Sample review', text: 'Perfect for our group of five. Clean rooms, the pool was never crowded and the grilled fish at Driftwood was the best we had all year.' },
  { name: 'Grace M.', room: 'Shoreline Room', date: 'Sample review', text: 'Booking online took two minutes and check-in was quick. Quiet beach, good Wi-Fi and the sunset lounge is a must.' },
];

export const gallery = [
  u('1507525428034-b723cf961d3e', 1000),
  u('1520250497591-112f2f40a3f4', 1000),
  u('1582719478250-c89cae4dc85b', 1000),
  u('1519046904884-53103b34b206', 1000),
  u('1566073771259-6a8506099945', 1000),
  u('1414235077428-338989a2e8c0', 1000),
  u('1544551763-46a013bb70d5', 1000),
  u('1578683010236-d716f9a3f461', 1000),
  u('1514933651103-005eec06c04b', 1000),
  u('1473116763249-2faaef81ccda', 1000),
  u('1571896349842-33c89424de2d', 1000),
  u('1505228395891-9a51e7e86bf6', 1000),
];

export const faqs = [
  { q: 'What time is check-in and check-out?', a: 'Check-in is from 2:00 PM and check-out is by 12:00 PM. Early check-in and late check-out depend on availability, so ask the front desk.' },
  { q: 'What do I need at check-in?', a: 'A valid government-issued ID for the person who made the booking, plus your booking reference.' },
  { q: 'Is my booking confirmed right away?', a: 'Online bookings start as pending. Our team confirms them, usually within a few hours, and you can see the status under My bookings.' },
  { q: 'Can I cancel?', a: 'Yes. You can cancel any pending or confirmed booking from My bookings up to the day before arrival.' },
  { q: 'Can I bring my own food and drinks?', a: 'Outside food and drinks may carry a corkage fee. Please check with the front desk before your stay.' },
  { q: 'Do you offer day passes?', a: 'Yes. A day pass gives you beach and pool access from 8 AM to 6 PM. Send an enquiry with your date and group size.' },
];
