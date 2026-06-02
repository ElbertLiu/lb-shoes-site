import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../i18n';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { t, lang } = useLanguage();
  const frontendUrl = (import.meta as any).env?.VITE_FRONTEND_URL || 'http://localhost:3000';

  const menu = [
    { name: 'Banner', path: '/admin/banner', icon: ImageIcon },
    { name: 'Categories', path: '/admin/categories', icon: LayoutDashboard },
    { name: t('admin.productsManagement'), path: '/admin/products', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex bg-[#f0f2f5]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar - Element Plus style */}
      <aside className="w-64 bg-white shadow-[2px_0_8px_0_rgba(29,35,41,.05)] flex flex-col z-10 hidden md:flex">
        <div className="h-16 flex items-center justify-center border-b border-[#f0f0f0] font-bold text-lg text-gray-800">
          ShoeFactory Admin
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {menu.map((item) => {
              const active = location.pathname.includes(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-6 py-3 text-sm transition-colors ${
                      active 
                        ? 'text-[#409eff] bg-[#ecf5ff] ltr:border-r-2 rtl:border-l-2 border-[#409eff]' 
                        : 'text-[#606266] hover:text-[#409eff] hover:bg-[#f5f7fa]'
                    }`}
                  >
                    <Icon className="w-4 h-4 ltr:mr-3 rtl:ml-3 rtl:mr-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Element Plus Style */}
        <header className="h-14 bg-white shadow-sm flex items-center justify-between px-6 z-0">
          <div className="flex items-center text-sm text-[#606266]">
            {t('admin.system')}
          </div>
          <div className="flex items-center gap-4 text-sm text-[#606266]">
            <a href={frontendUrl} className="hover:text-[#409eff] transition-colors">{t('admin.goBack')}</a>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              A
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
