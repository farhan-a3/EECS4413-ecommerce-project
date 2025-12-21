const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  {
    title: "Men's Cotton Jackets Sherpa Trucker Jacket 5 Pockets Cargo Snaps Fleece Jacket Turn-down Collar Winter Coats",
    price: 109.95,
    description: "Cotton Shell and Fleece Lining. Warm, soft, comfortable. There are five pockets, including 2 chest pockets, 2 side pockets and 1 inner jackets, meet the requirements for carrying everyday items.",
    category: "men's clothing",
    image: "/pictures/Jacket 1.png",
    rating: { rate: 3.9, count: 120 },
    stock:50
  },
  {
    title: "Tommy Hilfiger Mens Straight Fit Stretch JeansJeans ",
    price: 22.3,
    description: "Tommy Hilfiger’s fan-favorite men’s jeans are made in a straight fit with a hint of stretch for supreme comfort. Put simply, they feel like you've been wearing them for years.Tommy Hilfiger’s straight-fit jeans for men are spun with 99% cotton and 1% Spandex so you can keep moving and stay comfortable day and night. ",
    category: "men's clothing",
    image: "/pictures/jeans 1.png",
    rating: { rate: 4.1, count: 259 },
    stock: 35
  },
  {
    title: "Men's Fleece Lined Jean Jacket Winter Sherpa Windbreaker Cotton Denim Trucker Jacket",
    price: 55.99,
    description: "These men fleece denim jackets created with denim materials that are built for long-lasting wear. Sherpa line fleece, Basic turn down collar, front button down closure, long sleeves with button cuffs, single breasted. It is the perfect winter jacket for you to match any style clothing.",
    category: "men's clothing",
    image: "/pictures/jacket 2.png",
    rating: { rate: 4.7, count: 500 },
    stock: 20
  },
  {
    title: "Gildan Men's Ultra Cotton Short Sleeve T Shirt",
    price: 15.99,
    description: "The Gildan Men's Ultra Cotton Short Sleeve T Shirt features: 100% cotton fabric ,Ultra tight knit surface, Seamless twin needle collar, Taped neck and shoulders, Twin needle sleeves and hem, Tubular body, Safety colours are compliant with ANSI/ISEA High Visibility Standards.",
    category: "men's clothing",
    image: "/pictures/shirt 1.png",
    rating: { rate: 2.1, count: 430 },
    stock: 100
  },
  {
    title: "ChicSilver 925 Sterling Silver Heart/Round/Pear/Emerald Cut Simulated Birthstone Necklace Birthday Gift for Women (with Gift Box)",
    price: 695,
    description: "925 STERLING SILVER& BIRTHSRONE - Crafted in high quality hypoallergenic 925 sterling silver with simulated Sapphire and AAA cubic zirconia, it won't change color or get dark. Lead free & nickel free & anti-allergy, safe for the skin.",
    category: "jewelery",
    image: "/pictures/j1.png",
    rating: { rate: 4.6, count: 400 },
    stock: 10
  },
  {
    title: "LOUISA SECRET Double Strand Heart Birthstone Bracelets for Women, 925 Sterling Silver Fine Jewelry, Charm Link Bracelets Birthday Anniversary Christmas Gift for Women Wife Mom Girlfriend Lady ",
    price: 168,
    description: "The link charm bracelet is made of 925 sterling silver with round dot 5A cubic zirconia. The delicate beauty and Intricate design will make it an eye-catching piece of jewelry in any events. With its double strand unique design, this bracelet would get you a lot of complements for any occasion, for everyday, dating, work or formal occasions.",
    category: "jewelery",
    image: "/pictures/j2.png",
    rating: { rate: 3.9, count: 70 },
    stock: 20
  },
  {
    title: "SWAROVSKI Women's Attract Crystal Jewelry Collection",
    price: 9.99,
    description: "This rhodium plated necklace combines the precision and quality of sparkling Swarovski crystals with a timeless necklace design, for a touch of glamour for every occasion. The Attract necklace features a dainty eye-catching circular clear crystal pendant paired with a delicate rhodium plated chain",
    category: "jewelery",
    image: "/pictures/j3.png",
    rating: { rate: 3, count: 400 },
    stock: 20
  },
  {
    title: "Swarovski Bella Drop Pierced Earrings with Round White Swarovski Crystals and Matching Pavé on a Rhodium Plated Setting with a Lever Back Closure",
    price: 10.99,
    description: " Swarovski jewelry will maintain its brilliance over time when simple care practices are observed; remove before contact with water, lotions or perfumes to extend your jewelry's life. The Bella Drop Pierced Earrings combine the precision and quality of Swarovski crystals with a rhodium plated setting, for a trendy and refined accessory",
    category: "jewelery",
    image: "/pictures/j4.png",
    rating: { rate: 1.9, count: 100 },
    stock: 20
  },
  {
    title: "ASUS ROG Astral GeForce RTX™ 5090 White OC Edition Gaming Graphics Card (PCIe® 5.0, 32GB GDDR7, HDMI®/DP 2.1, 3.8-Slot, 4-Fan Design, Axial-tech Fans, Patented Vapor Chamber)",
    price: 64,
    description: "The ASUS ROG Astral GeForce RTX 5090 White OC Edition introduces ROG's first quad-fan graphics card, coupled with a patented vapor chamber, increased heatsink fin density, a phase-change GPU thermal pad, towering default clock speeds, boosted power delivery, and more. These premium innovations – amplified by an eye-catching die-cast frame and metal GPU bracket – combine to deliver absolute performance for demanding gaming scenarios.",
    category: "electronics",
    image: "/pictures/e1.png",
    rating: { rate: 3.3, count: 203 },
    stock: 20
  },
  {
    title: "Apple 2023 iMac All-in-One Desktop Computer with M3 chip: 8-core CPU, 10-core GPU, 24-inch 4.5K Retina Display, 8GB Unified Memory, 512GB SSD Storage. Works with iPhone/iPad; Pink; French",
    price: 109, 
    description: "SUPERCHARGED BY M3 — Get more done faster with a next-generation chip from Apple. From creating presentations to gaming, you’ll fly through work and play. IMMERSIVE DISPLAY—The 24-inch 4.5K Retina display features 500 nits of brightness and support for one billion colours. Everything from streaming movies to editing photos is sharp and colourful.",
    category: "electronics",
    image: "/pictures/e2.png",
    rating: { rate: 2.9, count: 470 },
    stock: 20
  },
  {
    title: "SAMSUNG 990 PRO SSD 2TB PCIe Gen4 NVMe M.2 Internal Solid State Hard Drive, Upto 7,450MB/s, Fast Speed for Gaming Heat Control, Direct Storage and Memory",
    price: 64,
    description: "Get random read/write speeds that are 40%/55% faster than 980 PRO; Experience up to 1400K/1550K IOPS, while sequential read/write speeds up to 7,450/6,900 MB/s reach near the max performance of PCIe 4.0. Up to 65% improvement in random performance enables faster loads for an ultimate gaming experience on PS5 and DirectStorage PC games",
    category: "electronics",
    image: "/pictures/e3.png",
    rating: { rate: 3.3, count: 203 },
    stock: 20
  },
  {
    title: "Microsoft Surface Pro (OLED) - Manufacturer Recertified - Copilot+ PC - 13 Touchscreen - Snapdragon X Elite - 16GB - 512GB SSD - Device only - (Latest Model, 11th Edition) - Sapphire",
    price: 109,
    description: "Faster than MacBook Air M3 [1] with unrivaled power for seamless productivity and creativity. Blazing NPU speed enables AI-powered applications Remarkably bright with enriched HDR tech, unveils crisper whites, darker blacks, and an extended color spectrum",
    category: "electronics",
    image: "/pictures/e4.png",
    rating: { rate: 2.9, count: 470 },
    stock: 20
  },
  {
    title: "Jescakoo Long Sleeve Shirt Women Fall Tunic Tops Crewneck Business Casual Clothes Trendy S-XXL",
    price: 109,
    description: "Unique Design: Sleeve detail adds to this top, it elevates it from a basic long sleeve tee to a dressy look. Classic crewneck brings more stylish to the tunic.",
    category: "women's clothing",
    image: "/pictures/w1.png",
    rating: { rate: 2.9, count: 470 },
    stock: 20
  },
  {
    title: "Women's Fall Short Dress Ribbed Knit Crewneck Long Sleeve A Line Flowy Casual Elegant Going Out Winter Dresses",
    price: 64,
    description: "This Long-Sleeved Women Dress Is Made Of Soft And Stretchy Soft Ribbed Knit Fabric Gives You a Super Soft Wearing Comfort. You Can Really Snuggle Up In The Comfy Material - Regardless Of Whether You'Re Spending The Day Off On The Couch Or You'Re Out.",
    category: "women's clothing",
    image: "/pictures/w2.png",
    rating: { rate: 3.3, count: 203 },
    stock: 20
  },
  {
    title: "VICHYIE Women Mock Neck Ribbed Bodycon Dress Long Sleeve Mini Pencil Dresses",
    price: 109,
    description: "The Ribbed Knit With Slight Fuzzy Inner Dress Skilfully Combines Comfortable Wearing Properties And a Cool Look. The Mock Neck Is Protecting Your Neck From Drafts And Looking Classy At The Same Time.",
    category: "women's clothing",
    image: "/pictures/w3.png",
    rating: { rate: 2.9, count: 470 },
    stock: 20
  }
];

async function main() {
  console.log('Starting seed process...');

  // 1. clean out the database in the CORRECT order
  // delete "Child" tables first
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  
  // now delete "Parent" tables
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned.');

  // 2. create an Admin and a Customer
  // note using createMany is efficient!
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@shop.com',
        name: 'Admin User',
        password: 'password123', 
        role: 'ADMIN', // can use 'ADMIN' or UserRole.ADMIN
      },
      {
        email: 'customer@test.com',
        name: 'John Doe',
        password: 'apple123',
        role: 'CUSTOMER',
        shippingAddress: '123 Fun St',
        shippingCountry: 'India',
        shippingState: 'Punjab',
        shippingZip: 'M5A 1B6',
        cardName: 'John Doe',
        cardNumber: '4411 1111 1111 1111',
        cardExpiry: '11/29',
      },
      {
        email: 'testuser1@testing.com',
        name: 'Test User1',
        password: 'apple123',
        role: 'CUSTOMER',
        shippingAddress: '139 Fun St',
        shippingCountry: 'India',
        shippingState: 'Punjab',
        shippingZip: 'M5A 1B6',
        cardName: 'Test User1',
        cardNumber: '4411 1111 1111 1122',
        cardExpiry: '07/11',
      }
    ],
  });
  console.log('Users (Admin & Customer) created.');

  // 3. create products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }
  
  console.log(`${products.length} products seeded.`);
  console.log('Seeding finished successfully.');
}

main().catch((e) => {
  console.error('Seeding error:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
