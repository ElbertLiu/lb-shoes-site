import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { products } from '../data';
import ClientLayout from '../layouts/ClientLayout';
import { useLanguage } from '../i18n';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';

  if (!product) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center p-20 text-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product.notFound')}</h2>
          <Link to="/products" className="text-blue-600 hover:underline">{t('product.back')}</Link>
        </div>
      </ClientLayout>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard`, {
      style: { background: '#1c1c1c', color: '#fff', border: 'none' }
    });
  };

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <Link to="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          {isRtl ? <ArrowRight className="w-4 h-4 ml-1" /> : <ArrowLeft className="w-4 h-4 mr-1" />}
          {t('product.back')}
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-gray-50 rounded-2xl overflow-hidden group">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              {/* Carousel Controls */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === idx ? 'border-gray-900' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col py-2 lg:py-6">
            <div className="mb-2 flex items-center gap-3">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                {t(`categories.${product.category}`)}
              </span>
              <span className="font-mono text-sm text-gray-400 font-medium">#{product.id}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('products.newProduct', { cat: t(`categories.${product.category}`), style: product.brief })}</h1>
            
            <div className="prose prose-sm text-gray-500 mb-8 max-w-none">
              <p>{t('product.desc')}</p>
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium text-sm">{t('product.price')}</span>
                <span className="text-2xl font-bold text-gray-900">{product.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium text-sm">{t('product.stockStatus')}</span>
                <span className={`flex items-center font-medium text-sm ${product.inStock ? 'text-green-600' : 'text-orange-500'}`}>
                  {product.inStock ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1.5 ltr:mr-1.5 rtl:ml-1.5 rtl:mr-0" /> {t('product.inStock')}</>
                  ) : (
                    <>{t('product.outOfStock')}</>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto">
              <p className="text-xs text-gray-400 mb-1 text-center lg:text-left rtl:lg:text-right">{t('product.contactTip')}</p>
              <button 
                onClick={() => copyToClipboard('+86 138-0000-0000', 'WhatsApp')}
                className="w-full group relative flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-4 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                <MessageCircle className="w-5 h-5 ltr:mr-1 rtl:ml-1 rtl:mr-0" />
                {t('product.copyWhatsapp')}
              </button>
              <button 
                onClick={() => copyToClipboard('Facebook: ShoeFactory123', 'Facebook')}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-4 transition-colors font-medium"
              >
                <Share2 className="w-5 h-5 ltr:mr-1 rtl:ml-1 rtl:mr-0" />
                {t('product.copyFacebook')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
