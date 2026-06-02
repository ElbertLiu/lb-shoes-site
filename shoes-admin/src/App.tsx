/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Providers
import { LanguageProvider } from './i18n';

// Admin Pages
import AdminProducts from './pages/admin/AdminProducts';
import AdminBanner from './pages/admin/AdminBanner';
import AdminCategories from './pages/admin/AdminCategories';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        {/* Toast Notification Container */}
        <Toaster position="top-center" />
        
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<Navigate to="/admin/products" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/products" replace />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/banner" element={<AdminBanner />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
