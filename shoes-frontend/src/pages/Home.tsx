import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { products, categories } from '../data';
import ClientLayout from '../layouts/ClientLayout';
import { useLanguage } from '../i18n';

export default function Home() {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const homeProducts = products.slice(0, 20);
  const { t, langObj } = useLanguage();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/products?search=${searchId.trim()}`);
    }
  };

  return (
    <ClientLayout>
      {/* Premium Hero Section - Apple Style */}
      <section className="relative w-full min-h-[500px] md:min-h-[600px] bg-white overflow-hidden flex items-center">
        {/* Background Image / Split */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full md:w-[60%] h-full">
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop" 
              alt="Premium Shoes"
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Gradients to blend image with solid color */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10 hidden md:block"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-10 md:hidden"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full py-20 md:py-0">
          <div className="w-full md:w-[55%] flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">{t('home.direct')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
              {t('home.slogan1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {t('home.slogan2')}
              </span>
            </h1>
            
            <div className="mt-4 md:mt-8">
              <h3 className="text-xs font-bold text-gray-400 mb-5 tracking-[0.2em] uppercase">{t('home.serve')}</h3>
              <div className="flex flex-wrap gap-3">
                {(langObj.home.buyers as string[]).map((audience, i) => (
                  <div key={i} className="px-5 py-2.5 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 rounded-xl text-sm font-medium text-gray-700 flex items-center transition-transform hover:-translate-y-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2.5 ltr:mr-2.5 rtl:ml-2.5 rtl:mr-0"></div>
                    {audience}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Search Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 my-12">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 rtl:right-4 rtl:left-auto w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={t('home.searchPlaceholder')} 
              className="w-full pl-12 pr-32 rtl:pr-12 rtl:pl-32 py-4 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm md:text-base"
            />
            <button 
              type="submit"
              className="absolute right-2 rtl:left-2 rtl:right-auto top-2 bottom-2 px-6 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {t('home.searchAction')}
            </button>
          </form>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t('home.featuredProducts')}</h2>
        </div>

        {/* 5 cols on desktop, 2 cols on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {homeProducts.map((product) => (
             <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              className="group bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col"
            >
              <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                <img 
                  src={product.images[0]} 
                  alt={product.id}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-grow text-center lg:text-left rtl:lg:text-right">
                <p className="text-xs font-mono text-gray-400 mb-1">{product.id}</p>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{t('products.newProduct', { cat: t(`categories.${product.category}`), style: product.brief })}</h3>
                <div className="mt-auto hidden lg:flex items-center justify-center py-2 border border-gray-200 rounded-md text-xs font-medium text-gray-700 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-colors">
                  {t('home.viewDetails')}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            to={`/products?category=${categories[0].id}`}
            className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all gap-2"
          >
            {t('home.viewAll')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </ClientLayout>
  );
}
