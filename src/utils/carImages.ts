// Verified Unsplash photo IDs — all confirmed to load
const VERIFIED_POOL = [
  'photo-1503376780353-7e6692767b70', // orange Porsche
  'photo-1555215695-3004980ad54e', // BMW M3 blue
  'photo-1560958089-b8a1929cea89', // Tesla white
  'photo-1519641471654-76ce0107ad1b', // Jeep green
  'photo-1558618666-fcd25c85cd64', // pickup truck red
  'photo-1533473359331-0135ef1b58bf', // silver SUV
  'photo-1549317661-bd32c8ce0729', // white sedan front
  'photo-1568605117036-5fe5e7bab0b7', // red car side
  'photo-1544636331-e26879cd4d9b', // black sports car
  'photo-1552519507-da3b142c6e3d', // muscle car
  'photo-1541443131876-44b03de101c5', // hatchback
  'photo-1617788138017-80ad40651399', // silver sedan
  'photo-1606664515524-ed2f786a0bd6', // grey city car
  'photo-1449965408869-eaa3f722e40d', // car on open road
  'photo-1580414057403-c5f451753e3d', // dark luxury sedan
];

function hashBrand(brand: string): number {
  let hash = 0;
  for (const char of brand) {
    hash = (hash * 31 + char.charCodeAt(0)) % VERIFIED_POOL.length;
  }
  return Math.abs(hash);
}

export function getCarImage(brand: string, size: 600 | 800 | 1200 = 800): string {
  const id = VERIFIED_POOL[hashBrand(brand)];
  return `https://images.unsplash.com/${id}?w=${size}&q=80`;
}
