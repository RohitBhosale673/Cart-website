import { db } from './src/db/db';

async function seed() {
  console.log('Seeding data...');
  
  // Clear existing data
  await db.products.clear();
  await db.customers.clear();
  await db.bills.clear();

  // Add Products
  await db.products.bulkAdd([
    { name: 'Sugar', marathiName: 'साखर', category: 'Grocery', price: 42, stock: 100 },
    { name: 'Peanuts', marathiName: 'शेंगदाणे', category: 'Grocery', price: 120, stock: 50 },
    { name: 'Cumin', marathiName: 'जिरे', category: 'Spices', price: 350, stock: 20 },
    { name: 'Turmeric', marathiName: 'हळद', category: 'Spices', price: 200, stock: 30 },
    { name: 'Rice (Basmati)', marathiName: 'तांदूळ', category: 'Grocery', price: 95, stock: 200 },
    { name: 'Sunflower Oil', marathiName: 'तेल', category: 'Oils', price: 155, stock: 40 },
    { name: 'Soap (Lux)', marathiName: 'साबण', category: 'Personal Care', price: 35, stock: 60 },
    { name: 'Parle-G Biscuit', marathiName: 'बिस्किट', category: 'Snacks', price: 10, stock: 150 },
    { name: 'Chana Dal', marathiName: 'डाळ', category: 'Grocery', price: 80, stock: 80 },
    { name: 'Toor Dal', marathiName: 'तूर डाळ', category: 'Grocery', price: 120, stock: 70 },
    { name: 'Moong Dal', marathiName: 'मूग डाळ', category: 'Grocery', price: 110, stock: 60 },
    { name: 'Masoor Dal', marathiName: 'मसूर डाळ', category: 'Grocery', price: 95, stock: 60 },
    { name: 'Urad Dal', marathiName: 'उडीद डाळ', category: 'Grocery', price: 105, stock: 50 },
    { name: 'Wheat Flour', marathiName: 'गव्हाचे पीठ', category: 'Grocery', price: 40, stock: 150 },
    { name: 'Rava', marathiName: 'रवा', category: 'Grocery', price: 45, stock: 80 },
    { name: 'Poha', marathiName: 'पोहे', category: 'Grocery', price: 50, stock: 100 },
    { name: 'Jaggery', marathiName: 'गूळ', category: 'Grocery', price: 60, stock: 90 },
    { name: 'Salt', marathiName: 'मीठ', category: 'Grocery', price: 20, stock: 200 },
    { name: 'Mustard Seeds', marathiName: 'मोहरी', category: 'Spices', price: 180, stock: 40 },
    { name: 'Coriander Seeds', marathiName: 'धणे', category: 'Spices', price: 160, stock: 40 },
    { name: 'Black Pepper', marathiName: 'मिरी', category: 'Spices', price: 450, stock: 20 },
    { name: 'Cardamom', marathiName: 'वेलदोडा', category: 'Spices', price: 900, stock: 10 },
    { name: 'Cloves', marathiName: 'लवंग', category: 'Spices', price: 700, stock: 10 },
    { name: 'Cinnamon', marathiName: 'दालचिनी', category: 'Spices', price: 500, stock: 15 },
    { name: 'Red Chilli Powder', marathiName: 'लाल तिखट', category: 'Spices', price: 280, stock: 35 },
    { name: 'Garam Masala', marathiName: 'गरम मसाला', category: 'Spices', price: 320, stock: 30 },
    { name: 'Kitchen King Masala', marathiName: 'किचन किंग मसाला', category: 'Spices', price: 120, stock: 40 },
    { name: 'Maggi Noodles', marathiName: 'मॅगी', category: 'Snacks', price: 14, stock: 120 },
    { name: 'Good Day Biscuit', marathiName: 'गुड डे बिस्किट', category: 'Snacks', price: 30, stock: 100 },
    { name: 'Marie Biscuit', marathiName: 'मारी बिस्किट', category: 'Snacks', price: 25, stock: 100 },
    { name: 'KurKure', marathiName: 'कुरकुरे', category: 'Snacks', price: 20, stock: 120 },
    { name: 'Lays Chips', marathiName: 'लेस चिप्स', category: 'Snacks', price: 20, stock: 120 },
    { name: 'Chivda', marathiName: 'चिवडा', category: 'Snacks', price: 120, stock: 50 },
    { name: 'Shengdana Chikki', marathiName: 'शेंगदाणा चिक्की', category: 'Snacks', price: 150, stock: 30 },
    { name: 'Tea Powder', marathiName: 'चहा पावडर', category: 'Beverages', price: 220, stock: 40 },
    { name: 'Coffee Powder', marathiName: 'कॉफी पावडर', category: 'Beverages', price: 350, stock: 30 },
    { name: 'Milk Powder', marathiName: 'दूध पावडर', category: 'Dairy', price: 420, stock: 20 },
    { name: 'Butter', marathiName: 'लोणी', category: 'Dairy', price: 520, stock: 20 },
    { name: 'Paneer', marathiName: 'पनीर', category: 'Dairy', price: 350, stock: 25 },
    { name: 'Groundnut Oil', marathiName: 'शेंगदाणा तेल', category: 'Oils', price: 170, stock: 40 },
    { name: 'Mustard Oil', marathiName: 'मोहरी तेल', category: 'Oils', price: 180, stock: 40 },
    { name: 'Coconut Oil', marathiName: 'नारळ तेल', category: 'Oils', price: 210, stock: 30 },
    { name: 'Hair Oil', marathiName: 'केसांचे तेल', category: 'Personal Care', price: 95, stock: 50 },
    { name: 'Shampoo', marathiName: 'शॅम्पू', category: 'Personal Care', price: 5, stock: 200 },
    { name: 'Toothpaste', marathiName: 'टूथपेस्ट', category: 'Personal Care', price: 95, stock: 80 },
    { name: 'Toothbrush', marathiName: 'टूथब्रश', category: 'Personal Care', price: 25, stock: 90 },
    { name: 'Detergent Powder', marathiName: 'डिटर्जंट पावडर', category: 'Cleaning', price: 120, stock: 60 },
    { name: 'Dishwash Bar', marathiName: 'भांडी धुण्याचा साबण', category: 'Cleaning', price: 25, stock: 120 },
    { name: 'Phenyl', marathiName: 'फिनाईल', category: 'Cleaning', price: 90, stock: 50 },
    { name: 'Matchbox', marathiName: 'माचीस', category: 'Household', price: 2, stock: 300 },
    { name: 'Agarbatti', marathiName: 'अगरबत्ती', category: 'Household', price: 35, stock: 100 },
    { name: 'Candle', marathiName: 'मेणबत्ती', category: 'Household', price: 10, stock: 150 },
    { name: 'Plastic Bags', marathiName: 'प्लास्टिक पिशवी', category: 'Household', price: 5, stock: 500 },
    { name: 'Almonds', marathiName: 'बदाम', category: 'Dry Fruits', price: 750, stock: 20 },
    { name: 'Cashews', marathiName: 'काजू', category: 'Dry Fruits', price: 850, stock: 20 },
    { name: 'Raisins', marathiName: 'मनुका', category: 'Dry Fruits', price: 300, stock: 30 },
    { name: 'Pistachios', marathiName: 'पिस्ता', category: 'Dry Fruits', price: 900, stock: 15 },
    { name: 'Dates', marathiName: 'खजूर', category: 'Dry Fruits', price: 280, stock: 30 },
    { name: 'Sabudana', marathiName: 'साबुदाणा', category: 'Grocery', price: 90, stock: 50 },
    { name: 'Rajma', marathiName: 'राजमा', category: 'Grocery', price: 120, stock: 40 },
    { name: 'Kabuli Chana', marathiName: 'काबुली चणे', category: 'Grocery', price: 110, stock: 50 },
    { name: 'Kala Chana', marathiName: 'काळे चणे', category: 'Grocery', price: 90, stock: 50 },
    { name: 'Green Peas', marathiName: 'मटार', category: 'Grocery', price: 85, stock: 40 },
    { name: 'Besan', marathiName: 'बेसन', category: 'Grocery', price: 75, stock: 60 },
    { name: 'Corn Flour', marathiName: 'कॉर्न फ्लोअर', category: 'Grocery', price: 65, stock: 40 },
    { name: 'Vermicelli', marathiName: 'शेवया', category: 'Grocery', price: 60, stock: 50 },
    { name: 'Papad', marathiName: 'पापड', category: 'Snacks', price: 120, stock: 30 },
    { name: 'Pickle', marathiName: 'लोणचे', category: 'Grocery', price: 180, stock: 40 },
    { name: 'Tomato Ketchup', marathiName: 'टोमॅटो सॉस', category: 'Sauces', price: 120, stock: 40 },
    { name: 'Soy Sauce', marathiName: 'सोया सॉस', category: 'Sauces', price: 110, stock: 30 },
    { name: 'Chilli Sauce', marathiName: 'चिली सॉस', category: 'Sauces', price: 110, stock: 30 },
    { name: 'Mayonnaise', marathiName: 'मेयोनीज', category: 'Sauces', price: 160, stock: 25 },
    { name: 'Jam', marathiName: 'जॅम', category: 'Spreads', price: 140, stock: 40 },
    { name: 'Peanut Butter', marathiName: 'शेंगदाणा बटर', category: 'Spreads', price: 220, stock: 25 },
    { name: 'Honey', marathiName: 'मध', category: 'Grocery', price: 260, stock: 20 },
    { name: 'Energy Drink', marathiName: 'एनर्जी ड्रिंक', category: 'Beverages', price: 40, stock: 80 },
    { name: 'Soft Drink', marathiName: 'थंड पेय', category: 'Beverages', price: 40, stock: 90 },
    { name: 'Mineral Water', marathiName: 'पिण्याचे पाणी', category: 'Beverages', price: 20, stock: 200 },
    { name: 'Ice Cream Cup', marathiName: 'आइसक्रीम', category: 'Dessert', price: 30, stock: 50 }
  ]);

  // Add Customers
  await db.customers.bulkAdd([
    { name: 'Rahul Patil', mobile: '9876543210', address: 'Shivaji Nagar, Pune', pendingBalance: 250, createdAt: Date.now() },
    { name: 'Sunita Deshmukh', mobile: '9123456789', address: 'Kothrud, Pune', pendingBalance: 0, createdAt: Date.now() },
    { name: 'Amit Shinde', mobile: '8877665544', address: 'Hinjewadi, Pune', pendingBalance: 1200, createdAt: Date.now() }
  ]);

  console.log('Seeding complete!');
}

seed().catch(err => console.error(err));
