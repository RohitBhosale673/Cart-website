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
    { name: 'Chana Dal', marathiName: 'डाळ', category: 'Grocery', price: 80, stock: 80 }
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
