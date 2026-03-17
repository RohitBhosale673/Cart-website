import Dexie from 'dexie';

export const db = new Dexie('GroceryShopDB');

db.version(1).stores({
  products: '++id, name, marathiName, category, price, stock',
  customers: '++id, name, mobile, address, pendingBalance, createdAt',
  bills: '++id, customerId, date, subtotal, previousBalance, totalAmount, paymentMethod, status'
});
