import React, { useState } from 'react';
import { db } from '../db/db';
import { Database, Download, Upload, Trash2, RefreshCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import './Settings.css';

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

  return (
    <div className="settings-page animation-fade-in">
      <div className="page-header mb-6">
        <h2>System Settings & Database</h2>
        <p className="text-muted">Manage your shop data and local storage</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
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
