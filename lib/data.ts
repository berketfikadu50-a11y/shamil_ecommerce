// All demo data lives here. Nothing is fetched from a server.
import PHOTOS from './photos.json';

export type Cat =
  | 'vehicles'
  | 'property'
  | 'phones'
  | 'electronics'
  | 'jobs'
  | 'services'
  | 'furniture'
  | 'fashion';

export type Status = 'active' | 'pending' | 'sold' | 'rejected';

export interface Listing {
  id: string;
  cat: Cat;
  title: string;
  price: number;
  per?: 'month';
  city: string;
  daysAgo: number;
  sellerId: string;
  desc: string;
  specs: [string, string][];
  photos: number;
  images?: string[];
  featured?: boolean;
  promoted?: boolean;
  status: Status;
  make?: string;
  model?: string;
  year?: number;
  km?: number;
  trans?: string;
  fuel?: string;
}

export interface Seller {
  id: string;
  name: string;
  dealer: boolean;
  since: number;
  phone: string;
  ads: number;
}

export const CATEGORIES: { slug: Cat; name: string }[] = [
  { slug: 'vehicles', name: 'Vehicles' },
  { slug: 'property', name: 'Property' },
  { slug: 'phones', name: 'Phones' },
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'jobs', name: 'Jobs' },
  { slug: 'services', name: 'Services' },
  { slug: 'furniture', name: 'Furniture' },
  { slug: 'fashion', name: 'Fashion' },
];

export const ADDIS = ['Bole', 'CMC', 'Piassa', 'Kazanchis', 'Megenagna', 'Sarbet', 'Ayat', 'Lebu', 'Mekanisa', 'Gerji'];
export const OTHER_CITIES = ['Adama', 'Bahir Dar', 'Hawassa'];
export const ALL_PLACES = [...ADDIS, ...OTHER_CITIES];
export const place = (city: string) => (ADDIS.includes(city) ? `${city}, Addis Ababa` : city);

export const MAKES = ['Toyota', 'Hyundai', 'Suzuki', 'Isuzu', 'Lada', 'Volkswagen', 'BYD', 'Nissan', 'Kia', 'Mitsubishi', 'Ford'];
export const TRANSMISSIONS = ['Automatic', 'Manual'];
export const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

export const SELLERS: Seller[] = [
  { id: 's1', name: 'Abebe Girma', dealer: false, since: 2021, phone: '+251 911 204 518', ads: 4 },
  { id: 's2', name: 'Selam Motors', dealer: true, since: 2019, phone: '+251 911 660 142', ads: 38 },
  { id: 's3', name: 'Hanna Tesfaye', dealer: false, since: 2022, phone: '+251 922 317 905', ads: 3 },
  { id: 's4', name: 'Yonas Auto Trading', dealer: true, since: 2018, phone: '+251 930 481 276', ads: 52 },
  { id: 's5', name: 'Mekdes Alemu', dealer: false, since: 2023, phone: '+251 913 772 034', ads: 2 },
  { id: 's6', name: 'Addis Homes Real Estate', dealer: true, since: 2020, phone: '+251 911 508 813', ads: 27 },
  { id: 's7', name: 'Kaleb Electronics', dealer: true, since: 2021, phone: '+251 944 190 667', ads: 61 },
  { id: 's8', name: 'Tigist Haile', dealer: false, since: 2020, phone: '+251 912 845 390', ads: 5 },
  { id: 's9', name: 'Biruk Tadesse', dealer: false, since: 2024, phone: '+251 937 026 451', ads: 2 },
  { id: 'me', name: 'Dawit Mekonnen', dealer: false, since: 2023, phone: '+251 911 000 000', ads: 4 },
];

export const sellerById = (id: string) => SELLERS.find((s) => s.id === id) ?? SELLERS[0];

// make, model, year, km, transmission, fuel, price, city, seller, daysAgo, flag, note
type V = [string, string, number, number, string, string, number, string, string, number, '' | 'f' | 'p', string];

const VEHICLES: V[] = [
  ['Toyota', 'Vitz', 2008, 142000, 'Automatic', 'Petrol', 1850000, 'Bole', 's1', 0, 'f', 'Silver, one owner since import. Very light on fuel and easy to park around Bole.'],
  ['Toyota', 'Corolla', 2010, 168000, 'Manual', 'Petrol', 2450000, 'CMC', 's3', 1, '', 'White, original paint. Engine and gearbox never opened. New tyres fitted last month.'],
  ['Toyota', 'RAV4', 2018, 64000, 'Automatic', 'Petrol', 6900000, 'Kazanchis', 's2', 0, 'f', 'Pearl white, leather seats, reverse camera, push start. Duty paid, plate code 2.'],
  ['Hyundai', 'i10', 2019, 48000, 'Manual', 'Petrol', 1950000, 'Megenagna', 's5', 2, '', 'Red, lady driven. Full service history at Marathon Motors.'],
  ['Suzuki', 'Dzire', 2021, 31000, 'Manual', 'Petrol', 2380000, 'Gerji', 's4', 1, 'p', 'Grey, ride-hailing ready. Around 20 km per litre in city driving.'],
  ['Isuzu', 'D-Max', 2020, 87000, 'Manual', 'Diesel', 6400000, 'Adama', 's4', 3, '', 'Double cab 4x4, white. Used for site supervision, never overloaded.'],
  ['Toyota', 'Hilux', 2021, 52000, 'Manual', 'Diesel', 9200000, 'Bole', 's2', 0, 'f', 'Double cab 2.8 diesel, 4x4, bull bar and canopy included. Company maintained.'],
  ['Lada', '2107', 1992, 310000, 'Manual', 'Petrol', 480000, 'Piassa', 's8', 5, '', 'Blue and white former taxi, repainted. Engine overhauled in 2024, spare parts included.'],
  ['Toyota', 'Yaris', 2007, 155000, 'Automatic', 'Petrol', 2100000, 'Sarbet', 's1', 4, '', 'Sedan, gold colour. Cold AC, clean interior, bolo valid until June.'],
  ['Toyota', 'Land Cruiser Prado', 2016, 98000, 'Automatic', 'Diesel', 13500000, 'Bole', 's2', 2, 'p', 'TX-L, black, seven seats, sunroof. Serviced only at Moenco.'],
  ['Volkswagen', 'ID.4', 2023, 12000, 'Automatic', 'Electric', 5300000, 'CMC', 's4', 1, 'f', 'Pro Crozz, 520 km range. Home charger and Type 2 cable included.'],
  ['BYD', 'Seagull', 2024, 4500, 'Automatic', 'Electric', 2650000, 'Ayat', 's4', 0, 'p', 'Flying edition, 405 km range, mint green. Almost new, still under dealer warranty.'],
  ['Nissan', 'Sunny', 2015, 110000, 'Automatic', 'Petrol', 2750000, 'Lebu', 's9', 6, '', 'Silver, spacious boot, family used. Minor scratch on rear bumper.'],
  ['Kia', 'Picanto', 2018, 59000, 'Manual', 'Petrol', 1780000, 'Mekanisa', 's5', 3, '', 'White, small and economical. Second owner, all documents complete.'],
  ['Suzuki', 'Swift', 2020, 37000, 'Automatic', 'Petrol', 2900000, 'Gerji', 's3', 2, '', 'Blue, touchscreen with Android Auto. Accident free.'],
  ['Hyundai', 'Tucson', 2019, 71000, 'Automatic', 'Diesel', 6100000, 'Megenagna', 's2', 7, '', 'Dark grey, panoramic roof, heated seats. Two keys.'],
  ['Toyota', 'Corolla', 2004, 245000, 'Manual', 'Petrol', 1650000, 'Hawassa', 's8', 8, '', 'Reliable daily driver. Suspension redone this year, strong engine.'],
  ['Mitsubishi', 'L200', 2017, 124000, 'Manual', 'Diesel', 5400000, 'Bahir Dar', 's9', 4, '', 'Double cab 4x4, silver. Good for farm and field work.'],
  ['Toyota', 'Vitz', 2012, 96000, 'Automatic', 'Petrol', 2350000, 'Ayat', 's4', 1, '', 'New shape, pink pearl. Push start, reverse sensors.'],
  ['Ford', 'Ranger', 2019, 82000, 'Automatic', 'Diesel', 7300000, 'Kazanchis', 's2', 9, '', 'Wildtrak 3.2, orange. Leather interior, tow bar fitted.'],
  ['Toyota', 'Corolla Cross', 2022, 28000, 'Automatic', 'Hybrid', 7800000, 'Bole', 's2', 3, '', 'Hybrid, white. About 22 km per litre. Adaptive cruise and lane assist.'],
  ['Suzuki', 'Alto', 2022, 19000, 'Manual', 'Petrol', 1550000, 'Lebu', 's5', 2, '', 'The cheapest car to run in the city. Barely used, like new inside.'],
  ['Hyundai', 'Elantra', 2017, 89000, 'Automatic', 'Petrol', 3450000, 'Sarbet', 's3', 5, '', 'Black, sunroof, alloy wheels. Imported from the UAE.'],
  ['Toyota', 'Hiace', 2015, 210000, 'Manual', 'Diesel', 4600000, 'Piassa', 's8', 6, '', 'Minibus, 12 seats, with route licence. On the road every day.'],
  ['Lada', 'Niva', 1998, 198000, 'Manual', 'Petrol', 720000, 'Adama', 's9', 10, '', 'Classic 4x4, dark green. Strong off road, new clutch.'],
  ['Isuzu', 'NPR', 2014, 265000, 'Manual', 'Diesel', 5900000, 'Mekanisa', 's4', 11, '', 'Dry cargo truck, 3.5 tonne. Body rebuilt in 2025.'],
  ['Toyota', 'RAV4', 2014, 132000, 'Automatic', 'Petrol', 4850000, 'Hawassa', 's1', 7, '', 'Maroon, AWD. Used by a family, bolo and insurance up to date.'],
  ['BYD', 'Song Plus', 2024, 8000, 'Automatic', 'Electric', 6200000, 'Gerji', 's4', 0, '', 'Champion edition, 605 km range, grey. 360 camera, ventilated seats.'],
];

const vehicleListings: Listing[] = VEHICLES.map((v, i) => {
  const [make, model, year, km, trans, fuel, price, city, sellerId, daysAgo, flag, note] = v;
  return {
    id: `v${i + 1}`,
    cat: 'vehicles',
    title: `${make} ${model} ${year}`,
    price,
    city,
    daysAgo,
    sellerId,
    desc: `${note} The car is in ${place(city)} and can be inspected by your own mechanic. Price is slightly negotiable for serious buyers.`,
    specs: [
      ['Make', make],
      ['Model', model],
      ['Year', String(year)],
      ['Mileage', `${km.toLocaleString('en-US')} km`],
      ['Transmission', trans],
      ['Fuel', fuel],
    ],
    photos: 4,
    featured: flag === 'f',
    promoted: flag === 'p',
    status: 'active',
    make,
    model,
    year,
    km,
    trans,
    fuel,
  };
});

type O = Omit<Listing, 'photos' | 'status'> & { status?: Status; photos?: number };
const other = (l: O): Listing => ({ photos: 3, status: 'active', ...l });

const otherListings: Listing[] = [
  // Property
  other({ id: 'p1', cat: 'property', title: '3-bedroom apartment near Bole Atlas', price: 18500000, city: 'Bole', daysAgo: 1, sellerId: 's6', featured: true,
    desc: 'Fifth-floor apartment with two balconies, lift, backup generator and basement parking. Title deed ready for transfer. Five minutes on foot from Edna Mall.',
    specs: [['Type', 'Apartment'], ['Bedrooms', '3'], ['Bathrooms', '2'], ['Area', '145 m²'], ['Floor', '5th']] }),
  other({ id: 'p2', cat: 'property', title: 'G+2 villa in a CMC compound', price: 42000000, city: 'CMC', daysAgo: 3, sellerId: 's6',
    desc: 'Modern villa on 250 m² in a gated compound. Five bedrooms, staff quarters, garden and parking for three cars.',
    specs: [['Type', 'Villa'], ['Bedrooms', '5'], ['Bathrooms', '4'], ['Area', '250 m²'], ['Floors', 'G+2']] }),
  other({ id: 'p3', cat: 'property', title: '2-bedroom condominium in Ayat', price: 6200000, city: 'Ayat', daysAgo: 0, sellerId: 's8',
    desc: '40/60 condominium on the second floor, fully finished with tiles and kitchen cabinets. Close to the light rail station.',
    specs: [['Type', 'Condominium'], ['Bedrooms', '2'], ['Bathrooms', '1'], ['Area', '78 m²'], ['Floor', '2nd']] }),
  other({ id: 'p4', cat: 'property', title: 'Furnished studio for rent in Kazanchis', price: 35000, per: 'month', city: 'Kazanchis', daysAgo: 2, sellerId: 's6', promoted: true,
    desc: 'Furnished studio with fibre internet, water tank and 24-hour security. Walking distance to the UNECA compound. Three months paid upfront.',
    specs: [['Type', 'Studio'], ['Bedrooms', '1'], ['Bathrooms', '1'], ['Area', '42 m²'], ['Furnished', 'Yes']] }),
  other({ id: 'p5', cat: 'property', title: 'Shop for rent on Piassa main road', price: 60000, per: 'month', city: 'Piassa', daysAgo: 6, sellerId: 's1',
    desc: 'Ground-floor shop facing the main road with heavy foot traffic. Suits a boutique, pharmacy or phone shop.',
    specs: [['Type', 'Shop'], ['Area', '40 m²'], ['Floor', 'Ground']] }),
  other({ id: 'p6', cat: 'property', title: '500 m² residential plot in Adama', price: 9500000, city: 'Adama', daysAgo: 9, sellerId: 's9',
    desc: 'Flat corner plot in a developed neighbourhood, with site plan and paid lease. Water and electricity lines at the gate.',
    specs: [['Type', 'Land'], ['Area', '500 m²'], ['Document', 'Site plan']] }),

  // Phones
  other({ id: 'ph1', cat: 'phones', title: 'iPhone 15 Pro Max 256GB', price: 185000, city: 'Bole', daysAgo: 0, sellerId: 's7', featured: true,
    desc: 'Natural titanium, sealed box, one-year shop warranty. Physical dual SIM version.',
    specs: [['Brand', 'Apple'], ['Model', 'iPhone 15 Pro Max'], ['Storage', '256 GB'], ['Condition', 'New']] }),
  other({ id: 'ph2', cat: 'phones', title: 'Samsung Galaxy S24 Ultra 512GB', price: 165000, city: 'Megenagna', daysAgo: 1, sellerId: 's7',
    desc: 'Titanium grey, brand new with S Pen and original charger. Free screen protector fitted in the shop.',
    specs: [['Brand', 'Samsung'], ['Model', 'Galaxy S24 Ultra'], ['Storage', '512 GB'], ['Condition', 'New']] }),
  other({ id: 'ph3', cat: 'phones', title: 'Tecno Camon 30 256GB', price: 32000, city: 'Piassa', daysAgo: 2, sellerId: 's7',
    desc: 'New in box, 8 GB RAM, 50 MP camera. Six-month warranty from the shop.',
    specs: [['Brand', 'Tecno'], ['Model', 'Camon 30'], ['Storage', '256 GB'], ['Condition', 'New']] }),
  other({ id: 'ph4', cat: 'phones', title: 'iPhone 12 64GB, used', price: 68000, city: 'Gerji', daysAgo: 4, sellerId: 's5',
    desc: 'Blue, battery health 86%. No scratches on the screen, comes with case and cable.',
    specs: [['Brand', 'Apple'], ['Model', 'iPhone 12'], ['Storage', '64 GB'], ['Condition', 'Used']] }),
  other({ id: 'ph5', cat: 'phones', title: 'Samsung Galaxy A15 128GB', price: 24500, city: 'Hawassa', daysAgo: 3, sellerId: 's9',
    desc: 'Used for two months, still has the box and receipt. Selling because I upgraded.',
    specs: [['Brand', 'Samsung'], ['Model', 'Galaxy A15'], ['Storage', '128 GB'], ['Condition', 'Used']] }),
  other({ id: 'ph6', cat: 'phones', title: 'Infinix Note 40 Pro 256GB', price: 38000, city: 'Mekanisa', daysAgo: 5, sellerId: 's7', promoted: true,
    desc: 'New, with wireless charging and a 108 MP camera. Available in green and gold.',
    specs: [['Brand', 'Infinix'], ['Model', 'Note 40 Pro'], ['Storage', '256 GB'], ['Condition', 'New']] }),

  // Electronics
  other({ id: 'e1', cat: 'electronics', title: 'Samsung 55-inch Crystal UHD smart TV', price: 78000, city: 'Bole', daysAgo: 1, sellerId: 's7',
    desc: '4K smart TV with wall bracket included. Free delivery and installation inside Addis Ababa.',
    specs: [['Brand', 'Samsung'], ['Model', 'CU7000'], ['Screen', '55 inch'], ['Condition', 'New']] }),
  other({ id: 'e2', cat: 'electronics', title: 'HP EliteBook 840 G8, Core i7', price: 85000, city: 'Kazanchis', daysAgo: 2, sellerId: 's7', featured: true,
    desc: 'Core i7 11th generation, 16 GB RAM, 512 GB SSD. Clean import from the US, battery holds five hours.',
    specs: [['Brand', 'HP'], ['Model', 'EliteBook 840 G8'], ['RAM', '16 GB'], ['Condition', 'Used']] }),
  other({ id: 'e3', cat: 'electronics', title: 'PlayStation 5 Slim with two controllers', price: 92000, city: 'CMC', daysAgo: 0, sellerId: 's3',
    desc: 'Disc edition, bought four months ago. Comes with EA FC 25 and two DualSense controllers.',
    specs: [['Brand', 'Sony'], ['Model', 'PS5 Slim'], ['Storage', '1 TB'], ['Condition', 'Used']] }),
  other({ id: 'e4', cat: 'electronics', title: 'LG 420-litre double-door fridge', price: 110000, city: 'Lebu', daysAgo: 6, sellerId: 's8',
    desc: 'Inverter compressor, no frost. Used for one year, selling because we are relocating.',
    specs: [['Brand', 'LG'], ['Capacity', '420 L'], ['Condition', 'Used']] }),
  other({ id: 'e5', cat: 'electronics', title: 'Canon EOS 250D with 18-55mm lens', price: 98000, city: 'Bahir Dar', daysAgo: 8, sellerId: 's9',
    desc: 'Low shutter count, with bag, 64 GB card and spare battery. Great for weddings and video.',
    specs: [['Brand', 'Canon'], ['Model', 'EOS 250D'], ['Condition', 'Used']] }),
  other({ id: 'e6', cat: 'electronics', title: 'MacBook Air M2 13-inch 256GB', price: 195000, city: 'Sarbet', daysAgo: 3, sellerId: 's7',
    desc: 'Midnight colour, 8 GB RAM. Battery cycle count 41, original charger and box.',
    specs: [['Brand', 'Apple'], ['Model', 'MacBook Air M2'], ['Storage', '256 GB'], ['Condition', 'Used']] }),

  // Furniture, fashion, jobs, services
  other({ id: 'f1', cat: 'furniture', title: 'L-shaped sofa, seven seats', price: 95000, city: 'Gerji', daysAgo: 2, sellerId: 's8',
    desc: 'Locally made with imported fabric, grey. Made to order in ten days, delivery included in Addis Ababa.',
    specs: [['Item', 'Sofa'], ['Material', 'Fabric and wood'], ['Condition', 'New']] }),
  other({ id: 'f2', cat: 'furniture', title: 'Dining table with six chairs', price: 62000, city: 'Mekanisa', daysAgo: 5, sellerId: 's1',
    desc: 'Solid wanza wood table with cushioned chairs. Two years old, no damage.',
    specs: [['Item', 'Dining set'], ['Material', 'Wanza wood'], ['Condition', 'Used']] }),
  other({ id: 'fa1', cat: 'fashion', title: 'Handwoven habesha kemis with netela', price: 14500, city: 'Piassa', daysAgo: 1, sellerId: 's5',
    desc: 'Shiro Meda handwoven cotton with green and gold tibeb. Size medium, can be adjusted for free.',
    specs: [['Item', 'Dress'], ['Size', 'M'], ['Condition', 'New']] }),
  other({ id: 'fa2', cat: 'fashion', title: 'Nike Air Force 1, size 42', price: 8500, city: 'Megenagna', daysAgo: 4, sellerId: 's3',
    desc: 'White, original, worn twice. Comes with the box.',
    specs: [['Item', 'Shoes'], ['Size', '42'], ['Condition', 'Used']] }),
  other({ id: 'j1', cat: 'jobs', title: 'Sales representative at a car dealership', price: 18000, per: 'month', city: 'Bole', daysAgo: 1, sellerId: 's2',
    desc: 'Selam Motors is hiring two sales representatives. Driving licence and good spoken English required. Commission on every sale.',
    specs: [['Employment', 'Full time'], ['Experience', '1 year or more'], ['Company', 'Selam Motors']] }),
  other({ id: 'j2', cat: 'jobs', title: 'Accountant with Peachtree experience', price: 25000, per: 'month', city: 'Kazanchis', daysAgo: 3, sellerId: 's6',
    desc: 'Degree in accounting and at least two years of experience. Monday to Saturday morning.',
    specs: [['Employment', 'Full time'], ['Experience', '2 years or more'], ['Company', 'Addis Homes Real Estate']] }),
  other({ id: 'sv1', cat: 'services', title: 'Home and office moving with a truck', price: 6500, city: 'Lebu', daysAgo: 2, sellerId: 's9',
    desc: 'Isuzu truck with four movers. We wrap furniture and reassemble beds and wardrobes. Price is for one trip inside Addis Ababa.',
    specs: [['Service', 'Moving'], ['Availability', 'Every day']] }),
  other({ id: 'sv2', cat: 'services', title: 'Satellite dish installation and repair', price: 1200, city: 'Ayat', daysAgo: 7, sellerId: 's1',
    desc: 'Ethiosat and Nilesat alignment, receiver setup and cabling. Same-day visits.',
    specs: [['Service', 'Installation'], ['Availability', 'Same day']] }),

  // The signed-in demo user's own ads
  other({ id: 'm1', cat: 'vehicles', title: 'Toyota Vitz 2010', price: 2150000, city: 'Bole', daysAgo: 4, sellerId: 'me', photos: 4,
    desc: 'Blue, compact and well kept. Serviced every 5,000 km. The car is in Bole, Addis Ababa and can be inspected by your own mechanic.',
    specs: [['Make', 'Toyota'], ['Model', 'Vitz'], ['Year', '2010'], ['Mileage', '118,000 km'], ['Transmission', 'Automatic'], ['Fuel', 'Petrol']],
    make: 'Toyota', model: 'Vitz', year: 2010, km: 118000, trans: 'Automatic', fuel: 'Petrol' }),
  other({ id: 'm2', cat: 'phones', title: 'iPhone 13 128GB, midnight', price: 89000, city: 'Bole', daysAgo: 6, sellerId: 'me',
    desc: 'Battery health 91%, always used with a case. Box and cable included.',
    specs: [['Brand', 'Apple'], ['Model', 'iPhone 13'], ['Storage', '128 GB'], ['Condition', 'Used']] }),
  other({ id: 'm3', cat: 'vehicles', title: 'Toyota Corolla 2008', price: 2250000, city: 'Gerji', daysAgo: 0, sellerId: 'me', photos: 4, status: 'pending',
    desc: 'Silver, automatic. Family car, selling to upgrade. The car is in Gerji, Addis Ababa and can be inspected by your own mechanic.',
    specs: [['Make', 'Toyota'], ['Model', 'Corolla'], ['Year', '2008'], ['Mileage', '176,000 km'], ['Transmission', 'Automatic'], ['Fuel', 'Petrol']],
    make: 'Toyota', model: 'Corolla', year: 2008, km: 176000, trans: 'Automatic', fuel: 'Petrol' }),
  other({ id: 'm4', cat: 'furniture', title: 'Office desk and chair', price: 12000, city: 'Bole', daysAgo: 21, sellerId: 'me', status: 'sold',
    desc: 'MDF desk with drawers and an adjustable mesh chair.',
    specs: [['Item', 'Desk and chair'], ['Material', 'MDF'], ['Condition', 'Used']] }),

  // Waiting for admin review
  other({ id: 'q1', cat: 'vehicles', title: 'Toyota Hilux 2016', price: 6800000, city: 'Adama', daysAgo: 0, sellerId: 's9', photos: 4, status: 'pending',
    desc: 'Single cab diesel, white. Used on a farm outside Adama, mechanically sound.',
    specs: [['Make', 'Toyota'], ['Model', 'Hilux'], ['Year', '2016'], ['Mileage', '161,000 km'], ['Transmission', 'Manual'], ['Fuel', 'Diesel']],
    make: 'Toyota', model: 'Hilux', year: 2016, km: 161000, trans: 'Manual', fuel: 'Diesel' }),
  other({ id: 'q2', cat: 'phones', title: 'Samsung Galaxy Z Flip 5 256GB', price: 98000, city: 'CMC', daysAgo: 0, sellerId: 's5', status: 'pending',
    desc: 'Mint colour, used for six months, no crease damage.',
    specs: [['Brand', 'Samsung'], ['Model', 'Galaxy Z Flip 5'], ['Storage', '256 GB'], ['Condition', 'Used']] }),
  other({ id: 'q3', cat: 'property', title: '1-bedroom apartment for rent in Gerji', price: 28000, per: 'month', city: 'Gerji', daysAgo: 0, sellerId: 's6', status: 'pending',
    desc: 'Unfurnished one-bedroom on the third floor with parking and a water tank.',
    specs: [['Type', 'Apartment'], ['Bedrooms', '1'], ['Area', '55 m²']] }),
  other({ id: 'q4', cat: 'vehicles', title: 'Hyundai Accent 2013', price: 2600000, city: 'Hawassa', daysAgo: 1, sellerId: 's8', photos: 4, status: 'pending',
    desc: 'Grey sedan, manual. Clean interior, new battery.',
    specs: [['Make', 'Hyundai'], ['Model', 'Accent'], ['Year', '2013'], ['Mileage', '137,000 km'], ['Transmission', 'Manual'], ['Fuel', 'Petrol']],
    make: 'Hyundai', model: 'Accent', year: 2013, km: 137000, trans: 'Manual', fuel: 'Petrol' }),
  other({ id: 'q5', cat: 'electronics', title: 'JBL PartyBox 310 speaker', price: 74000, city: 'Megenagna', daysAgo: 1, sellerId: 's7', status: 'pending',
    desc: 'New in box, 240 W with light show and two microphone inputs.',
    specs: [['Brand', 'JBL'], ['Model', 'PartyBox 310'], ['Condition', 'New']] }),
];

// Real photos live in public/listings and are listed per listing id in photos.json.
// A listing with no entry there falls back to the tinted placeholder.
const photoMap = PHOTOS as Record<string, string[]>;

export const LISTINGS: Listing[] = [...vehicleListings, ...otherListings].map((l) => {
  const images = photoMap[l.id];
  return images?.length ? { ...l, images, photos: images.length } : l;
});

// ---- Post-an-ad form fields per category
export interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  placeholder?: string;
}

const CONDITION: Field = { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used'] };

export const FIELDS: Record<Cat, Field[]> = {
  vehicles: [
    { key: 'make', label: 'Make', type: 'select', options: MAKES },
    { key: 'model', label: 'Model', type: 'text', placeholder: 'Vitz' },
    { key: 'year', label: 'Year', type: 'number', placeholder: '2015' },
    { key: 'mileage', label: 'Mileage', type: 'number', placeholder: '85000' },
    { key: 'transmission', label: 'Transmission', type: 'select', options: TRANSMISSIONS },
    { key: 'fuel', label: 'Fuel', type: 'select', options: FUELS },
  ],
  property: [
    { key: 'title', label: 'Title', type: 'text', placeholder: '2-bedroom apartment in Bole' },
    { key: 'type', label: 'Type', type: 'select', options: ['Apartment', 'Villa', 'Condominium', 'Studio', 'Shop', 'Land'] },
    { key: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: '2' },
    { key: 'area', label: 'Area', type: 'number', placeholder: '90' },
  ],
  phones: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'iPhone 13 128GB' },
    { key: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Tecno', 'Infinix', 'Xiaomi', 'Other'] },
    { key: 'storage', label: 'Storage', type: 'select', options: ['64 GB', '128 GB', '256 GB', '512 GB'] },
    CONDITION,
  ],
  electronics: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Samsung 43-inch smart TV' },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Samsung' },
    CONDITION,
  ],
  jobs: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Receptionist' },
    { key: 'company', label: 'Company', type: 'text', placeholder: 'Company name' },
    { key: 'employment', label: 'Employment', type: 'select', options: ['Full time', 'Part time', 'Contract'] },
  ],
  services: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Car wash at your home' },
    { key: 'service', label: 'Service', type: 'text', placeholder: 'Cleaning' },
  ],
  furniture: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Queen bed with mattress' },
    { key: 'material', label: 'Material', type: 'text', placeholder: 'Wood' },
    CONDITION,
  ],
  fashion: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Leather jacket' },
    { key: 'size', label: 'Size', type: 'text', placeholder: 'M' },
    CONDITION,
  ],
};

// ---- Chats
export interface Message {
  me: boolean;
  text: string;
  time: string;
}
export interface Convo {
  id: string;
  listingId: string;
  sellerId: string;
  unread: number;
  messages: Message[];
}

export const CONVOS: Convo[] = [
  {
    id: 'c1', listingId: 'v3', sellerId: 's2', unread: 1,
    messages: [
      { me: true, text: 'Selam, is the RAV4 still available?', time: '09:12' },
      { me: false, text: 'Selam! Yes, it is in our showroom in Kazanchis.', time: '09:14' },
      { me: true, text: 'Is the price negotiable? And is the duty fully paid?', time: '09:15' },
      { me: false, text: 'Duty is fully paid, plate code 2. We can talk about the price after you see the car.', time: '09:18' },
      { me: true, text: 'Good. Can I bring my mechanic tomorrow morning?', time: '09:20' },
      { me: false, text: 'Of course. We open at 8:30, ask for Selam at the front desk.', time: '09:21' },
    ],
  },
  {
    id: 'c2', listingId: 'ph1', sellerId: 's7', unread: 0,
    messages: [
      { me: true, text: 'Do you have the iPhone 15 Pro Max in blue?', time: 'Yesterday' },
      { me: false, text: 'Only natural and black titanium right now. Blue arrives on Friday.', time: 'Yesterday' },
    ],
  },
  {
    id: 'c3', listingId: 'p4', sellerId: 's6', unread: 2,
    messages: [
      { me: true, text: 'Hello, is the studio available from next month?', time: 'Mon' },
      { me: false, text: 'Yes, it is free from the 1st.', time: 'Mon' },
      { me: false, text: 'You can visit any day after 4 pm.', time: 'Mon' },
    ],
  },
  {
    id: 'c4', listingId: 'm1', sellerId: 's3', unread: 0,
    messages: [
      { me: false, text: 'Hi, I am interested in your Vitz. What is your last price?', time: 'Sun' },
      { me: true, text: 'Hi Hanna. I can do 2,100,000 if you come this week.', time: 'Sun' },
    ],
  },
];

export const AUTO_REPLIES = [
  'Thanks for your message. Yes, that works for me.',
  'It is still available. When would you like to see it?',
  'I can share more photos on Telegram if you like.',
];

// ---- Admin
export interface Report {
  id: string;
  listingId: string;
  reason: string;
  by: string;
  when: string;
  open: boolean;
}

export const REPORTS: Report[] = [
  { id: 'r1', listingId: 'v8', reason: 'Wrong price or details', by: 'Meron K.', when: '2 hours ago', open: true },
  { id: 'r2', listingId: 'ph4', reason: 'Already sold', by: 'Samuel B.', when: '5 hours ago', open: true },
  { id: 'r3', listingId: 'p5', reason: 'Scam or fraud', by: 'Liya T.', when: 'Yesterday', open: true },
  { id: 'r4', listingId: 'v17', reason: 'Duplicate ad', by: 'Henok A.', when: '2 days ago', open: true },
];

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  type: 'Individual' | 'Dealer';
  ads: number;
  joined: string;
  suspended: boolean;
}

export const USERS: AdminUser[] = SELLERS.map((s) => ({
  id: s.id,
  name: s.name,
  phone: s.phone,
  type: s.dealer ? 'Dealer' : 'Individual',
  ads: s.ads,
  joined: String(s.since),
  suspended: false,
}));

export const WEEK_CHART = [
  { day: 'Wed', n: 64 },
  { day: 'Thu', n: 72 },
  { day: 'Fri', n: 58 },
  { day: 'Sat', n: 91 },
  { day: 'Sun', n: 103 },
  { day: 'Mon', n: 77 },
  { day: 'Tue', n: 86 },
];

export const PACKAGES = [
  { id: 'basic', name: 'Basic', price: 150, days: 3, perks: ['Moves to the top of its category', 'Promoted badge'] },
  { id: 'featured', name: 'Featured', price: 400, days: 7, perks: ['Shown in the Featured row on the home page', 'Featured badge', 'About 5 times more views'] },
  { id: 'premium', name: 'Premium', price: 900, days: 14, perks: ['Everything in Featured', 'First in search results', 'Shared on the Shamil Shop Telegram channel'] },
] as const;
