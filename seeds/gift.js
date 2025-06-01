const mongoose = require('mongoose');
const faker = require('faker');
const Gift = require('../models/gift');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Helper: Generate meaningful gift names per category
const generateGiftName = (category) => {
  switch (category) {
    case 'Toys':
      return faker.commerce.productAdjective() + ' ' + faker.animal.type() + ' Toy';
    case 'Books':
      return faker.company.bsBuzz() + ' of the ' + faker.hacker.noun();
    case 'Fashion':
      return faker.commerce.color() + ' ' + faker.commerce.productAdjective() + ' Outfit';
    case 'Gadgets':
      return 'Smart ' + faker.hacker.noun() + ' Pro';
    case 'Home Decor':
      return faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial() + ' Decor';
    default:
      return faker.commerce.productName();
  }
};

// Helper: Generate matching description
const generateDescription = (category, name) => {
  switch (category) {
    case 'Toys':
      return `The ${name} is perfect for playful afternoons. Safe, colorful, and loved by kids aged 3+.`;
    case 'Books':
      return `Get lost in "${name}", a thrilling tale packed with unexpected twists and vivid characters.`;
    case 'Fashion':
      return `Turn heads with the ${name}, a trendy outfit made for both comfort and flair.`;
    case 'Gadgets':
      return `Upgrade your life with the ${name}, featuring sleek design and the latest tech.`;
    case 'Home Decor':
      return `Elevate your space with the ${name}. A minimalist touch to any room.`;
    default:
      return faker.commerce.productDescription();
  }
};

const seedGifts = async () => {
  await Gift.deleteMany();

  const categories = ['Toys', 'Books', 'Fashion', 'Gadgets', 'Home Decor'];

  const gifts = Array.from({ length: 10 }, () => {
    const category = faker.random.arrayElement(categories);
    const name = generateGiftName(category);

    return {
      name,
      description: generateDescription(category, name),
      price: parseFloat(faker.commerce.price(15, 150)),
      imageUrl: `https://placehold.co/300x200?text=${encodeURIComponent(category)}&font=roboto`,
      createdAt: faker.date.past(),
      availability: faker.datatype.number({ min: 5, max: 100 }),
      category,
      inCartUsers: [],
      rating: 0,
      sellerID: '123',  
      sellerName: 'user', 
      sellerEmail: 'user@gmail.com'
    };
  });

  await Gift.insertMany(gifts);
  console.log('Seeded gifts!');
  mongoose.connection.close();
};

seedGifts();
