import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useSearchParams, matchPath } from 'react-router-dom';
import { Search, Menu, Home, Box, Phone, Globe, ChevronDown } from 'lucide-react';
import { categories, products } from '../data';
import { useLanguage, languages, LanguageCode } from '../i18n';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const productMatch = matchPath({ path: '/product/:id' }, location.pathname);
  const productId = productMatch?.params.id;
  const currentProduct = productId ? products.find(p => p.id === productId) : null;
  const currentCategory = categoryParam || currentProduct?.category;
  
  const isContactPage = location.pathname === '/contact';
  const { lang, setLang, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isProductsTabActive = location.pathname.startsWith('/products') || location.pathname.startsWith('/product/');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 pt-16 md:pt-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* --- Desktop Header --- */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Top Tab */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" onClick={() => window.scrollTo(0, 0)} className="text-xl font-bold tracking-wider text-gray-900">
                SHOE<span className="text-blue-600">FACTORY</span>
              </Link>
              <nav className="flex gap-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Link to="/" onClick={() => window.scrollTo(0, 0)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>{t('nav.home')}</Link>
                <Link to={`/products?category=${categories[0].id}`} onClick={() => window.scrollTo(0, 0)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isProductsTabActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>{t('nav.products')}</Link>
                <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/contact' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>{t('nav.contact')}</Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full"
                >
                  <Globe className="w-4 h-4 mr-1.5" /> 
                  <span className="mr-1">{languages[lang]}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {Object.entries(languages).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLang(code as LanguageCode);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${lang === code ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sub Tab (Hidden on Contact Page) */}
        {!isContactPage && (
          <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-6 overflow-x-auto no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {categories.map((cat) => {
              const isActive = currentCategory === cat.id;
              return (
                <Link 
                  key={cat.id} 
                  to={`/products?category=${cat.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`text-sm whitespace-nowrap transition-colors relative flex items-center h-full ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  {t(`categories.${cat.id}`)}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-sm"></span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* --- Mobile Header --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-16 px-4 flex items-center justify-between">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="text-lg font-bold text-gray-900 leading-none flex items-center">
          SHOE<span className="text-blue-600">FACTORY</span>
        </Link>
        <div className="flex items-center gap-2">
            <select 
             value={lang} 
             onChange={(e) => setLang(e.target.value as LanguageCode)}
             className="text-xs bg-gray-100 rounded-full py-1.5 px-2 border-0 outline-none text-gray-700 appearance-none pl-3 pr-6 relative"
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{code.toUpperCase()}</option>
              ))}
            </select>
          <Link to={`/products?category=${categories[0].id}`} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`relative ${!isContactPage ? 'md:pt-[104px]' : 'md:pt-14'} min-h-screen`}>
        {children}
      </main>

      {/* --- Mobile Bottom Nav Bar --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around pb-safe">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className={`flex flex-col items-center py-3 px-6 ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">{t('nav.home')}</span>
        </Link>
        <Link to={`/products?category=${categories[0].id}`} onClick={() => window.scrollTo(0, 0)} className={`flex flex-col items-center py-3 px-6 ${isProductsTabActive ? 'text-blue-600' : 'text-gray-500'}`}>
          <Box className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">{t('nav.products')}</span>
        </Link>
        <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className={`flex flex-col items-center py-3 px-6 ${location.pathname === '/contact' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Phone className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">{t('nav.contact')}</span>
        </Link>
      </nav>
    </div>
  );
}
