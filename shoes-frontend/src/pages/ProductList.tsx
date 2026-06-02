import { useState, useMemo, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { products, categories } from '../data';
import ClientLayout from '../layouts/ClientLayout';
import { useLanguage } from '../i18n';

const ITEMS_PER_PAGE = 50;

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const { t } = useLanguage();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchParam || '');

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (categoryParam) {
      result = result.filter(p => p.category === categoryParam);
    }
    
    if (searchParam) {
      const q = searchParam.toLowerCase();
      result = result.filter(p => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
    }
    
    return result;
  }, [categoryParam, searchParam]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchInput) {
      setSearchParams({ search: searchInput });
    } else {
      setSearchParams({});
    }
    setCurrentPage(1);
  };

  const handleCategorySelect = (catId: string) => {
    setSearchParams({ category: catId });
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        
        {/* Mobile Format: Category Selector inside page */}
        <div className="md:hidden pb-4 mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar flex gap-3">
           <button 
              onClick={() => { setSearchParams({}); setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!categoryParam && !searchParam ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {t('products.all')}
            </button>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryParam === cat.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
               {t(`categories.${cat.id}`)}
            </button>
          ))}
        </div>

        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryParam ? t(`categories.${categoryParam}`) : searchParam ? t('products.searchResults', {query: searchParam}) : t('products.allProducts')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t('products.foundProducts', {count: filteredProducts.length})}</p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rtl:right-3 rtl:left-auto" />
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('products.searchPlaceholder')} 
              className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </form>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t('products.noProducts')}</h3>
            <p className="text-gray-500 mt-1">{t('products.tryAnother')}</p>
            <button 
              onClick={() => { setSearchParams({}); setSearchInput(''); }}
              className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800"
            >
              {t('products.allProducts')}
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {paginatedProducts.map((product) => (
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
                    <div className="mt-auto hidden lg:flex items-center justify-center py-2 border border-gray-200 rounded-md text-xs font-medium text-gray-700 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-colors mt-4">
                      {t('home.viewDetails')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Element Plus Style minimal */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2" dir="ltr">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
}
