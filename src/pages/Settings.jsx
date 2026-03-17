import React, { useState } from 'react';
import { db } from '../db/db';
import { Database, Download, Upload, Trash2, RefreshCcw, ShieldAlert, CheckCircle2, ListPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import './Settings.css';

const DEFAULT_PRODUCTS = [
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
];

const Settings = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Export Data to JSON
  const exportData = async () => {
    setIsExporting(true);
    try {
      const exportObj = {
        products: await db.products.toArray(),
        customers: await db.customers.toArray(),
        bills: await db.bills.toArray(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportObj, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'KiranaShop_Backup_' + new Date().toISOString().split('T')[0] + '.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      Swal.fire('Success', 'Backup file downloaded successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      Swal.fire('Error', 'Failed to export data.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Import Data from JSON
  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Importing data will OVERWRITE your current database tables. Make sure you have a backup!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Import it!'
    });

    if (!result.isConfirmed) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.products || !data.customers || !data.bills) {
          throw new Error('Invalid backup file format.');
        }

        // Clear existing data
        await Promise.all([
          db.products.clear(),
          db.customers.clear(),
          db.bills.clear()
        ]);

        // Bulk add new data
        await Promise.all([
          db.products.bulkAdd(data.products),
          db.customers.bulkAdd(data.customers),
          db.bills.bulkAdd(data.bills)
        ]);

        Swal.fire('Imported!', 'Database restored from backup.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error('Import failed:', error);
        Swal.fire('Error', 'Failed to import data. Please check the file format.', 'error');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Factory Reset
  const handleFactoryReset = async () => {
    const result = await Swal.fire({
      title: 'FACTORY RESET?',
      text: "This will DELETE ALL data (Products, Customers, Bills) permanently! This action cannot be undone.",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'YES, DELETE EVERYTHING'
    });

    if (result.isConfirmed) {
      const confirmInput = await Swal.fire({
        title: 'Type "DELETE" to confirm',
        input: 'text',
        inputValidator: (value) => {
          if (value !== 'DELETE') return 'You must type DELETE';
        },
        showCancelButton: true
      });

      if (confirmInput.isConfirmed) {
        await Promise.all([
          db.products.clear(),
          db.customers.clear(),
          db.bills.clear()
        ]);
        Swal.fire('Reset Complete', 'Your database is now empty.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  };

  // Seed Products
  const handleSeedProducts = async (clearFirst = false) => {
    const result = await Swal.fire({
      title: clearFirst ? 'Reset Inventory?' : 'Load Shop Products?',
      text: clearFirst 
        ? "This will DELETE all current products and load the 80+ default items. Continue?" 
        : "This will add 80+ common grocery items. Continue?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Yes, Proceed'
    });

    if (result.isConfirmed) {
      try {
        if (clearFirst) {
          await db.products.clear();
        }
        
        // Use bulkPut and spread to ensure fresh objects without existing IDs
        const itemsToLoad = DEFAULT_PRODUCTS.map(p => ({ ...p }));
        await db.products.bulkPut(itemsToLoad);
        
        Swal.fire({
          title: 'Success',
          text: `${itemsToLoad.length} products loaded into inventory!`,
          icon: 'success',
          timer: 2000
        });
        
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error('Seeding failed:', error);
        Swal.fire('Error', `Failed to add products: ${error.message}`, 'error');
      }
    }
  };

  return (
    <div className="settings-page animation-fade-in">
      <div className="page-header mb-6">
        <h2>System Settings & Database</h2>
        <p className="text-muted">Manage your shop data and local storage</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bulk Add Products Card */}
        <div className="card h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-light rounded-lg">
              <ListPlus className="text-emerald" size={24} />
            </div>
            <h3 className="m-0">Inventory Setup</h3>
          </div>
          <p className="text-sm text-muted mb-6">
            Instantly populate your shop with a common list of 80+ products. 
            Choose whether to add to existing list or start fresh.
          </p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleSeedProducts(false)}
              className="btn btn-primary w-full py-3"
            >
              <ListPlus size={18} />
              Add 80+ Products to Current
            </button>
            <button 
              onClick={() => handleSeedProducts(true)}
              className="btn btn-secondary w-full py-3"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary-dark)' }}
            >
              <RefreshCcw size={18} />
              Clear & Load 80+ Products
            </button>
          </div>
        </div>
        {/* Backup Card */}
        <div className="card h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-light rounded-lg">
              <Download className="text-emerald" size={24} />
            </div>
            <h3 className="m-0">Database Backup</h3>
          </div>
          <p className="text-sm text-muted mb-6">
            Download a copy of all your products, customers, and bill history. 
            Keep this file safe as a backup for your business.
          </p>
          <button 
            onClick={exportData} 
            disabled={isExporting}
            className="btn btn-primary w-full py-3"
          >
            {isExporting ? <RefreshCcw className="animate-spin" size={18} /> : <Download size={18} />}
            Export Everything to .JSON
          </button>
        </div>

        {/* Restore Card */}
        <div className="card h-full border-dashed">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-light rounded-lg">
              <Upload className="text-blue" size={24} />
            </div>
            <h3 className="m-0">Restore Data</h3>
          </div>
          <p className="text-sm text-muted mb-6">
            Upload a previously exported backup file to restore your database. 
            <strong className="text-red"> Warning:</strong> This will replace your current data.
          </p>
          <label className="btn btn-secondary w-full py-3 cursor-pointer">
            <Upload size={18} />
            {isImporting ? 'Importing...' : 'Select Backup File'}
            <input type="file" accept=".json" onChange={importData} hidden />
          </label>
        </div>

        {/* Reset Card */}
        <div className="card h-full border-red-light bg-red-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-light rounded-lg">
              <Trash2 className="text-red" size={24} />
            </div>
            <h3 className="m-0 text-red">Factory Reset</h3>
          </div>
          <p className="text-sm text-muted mb-6">
            Clear all data from the application. Use this if you want to start fresh 
            or remove all demo products and customers.
          </p>
          <button 
            onClick={handleFactoryReset}
            className="btn btn-danger w-full py-3"
          >
            <ShieldAlert size={18} />
            Erase All Shop Data
          </button>
        </div>

        {/* Info Card */}
        <div className="card h-full bg-slate-50 border-none shadow-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-lg shadow-sm border">
              <Database className="text-slate" size={24} />
            </div>
            <h3 className="m-0">System Info</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted">Database Engine:</span>
              <span className="font-bold">IndexedDB (Dexie)</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted">Status:</span>
              <span className="text-emerald font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Active & Local
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted">Storage Location:</span>
              <span className="font-bold">This Browser Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
