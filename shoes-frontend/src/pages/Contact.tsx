import { MessageCircle, MapPin, Building2, Globe, Facebook, Factory, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import ClientLayout from '../layouts/ClientLayout';
import { useLanguage } from '../i18n';

export default function Contact() {
  const { t, lang } = useLanguage();
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard`, {
      style: { background: '#1c1c1c', color: '#fff', border: 'none' }
    });
  };

  return (
    <ClientLayout>
      <div className="min-h-[calc(100vh-104px)] md:h-[calc(100vh-104px)] bg-[#f8fafc] md:overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Visual Storyteller */}
        <div className="w-full md:w-1/2 h-64 md:h-full p-4 md:p-8 flex flex-col justify-center">
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2600&auto=format&fit=crop" 
              alt="Premium Shoes Manufacturing"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90"
            />
            {/* Elegant overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] via-[#1e293b]/90 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <span className="inline-flex py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white font-medium tracking-[0.2em] text-xs uppercase self-start mb-6 backdrop-blur-md">
                {t('contact.aboutUs')}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-4">
                {t('contact.subtitle1')}
              </h1>
              <p className="text-lg md:text-2xl text-blue-200 font-medium tracking-wide">
                {t('contact.subtitle2')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Dense Information Panel */}
        <div className="w-full md:w-1/2 h-full overflow-y-auto px-6 py-10 md:p-12 flex flex-col justify-center">
          <div className="max-w-xl mx-auto w-full">
            
            {/* Story */}
            <div className="mb-10 text-gray-600">
              <p className="text-lg md:text-xl leading-relaxed mb-4 text-gray-800 font-medium">
                {t('contact.p1')}
              </p>
              <p className="text-sm md:text-base leading-relaxed text-gray-500">
                {t('contact.p2')}
              </p>
            </div>

            {/* Micro Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{t('contact.feature1Title')}</h4>
                  <p className="text-xs text-gray-500 leading-snug">{t('contact.feature1Desc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{t('contact.feature2Title')}</h4>
                  <p className="text-xs text-gray-500 leading-snug">{t('contact.feature2Desc')}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-10"></div>

            {/* Quick Contact & Address */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <button 
                  onClick={() => copyToClipboard('+86 138-0000-0000', 'WhatsApp')}
                  className="flex-1 group flex items-center p-4 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 hover:border-green-200 hover:shadow-md transition-all text-left"
                >
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0 mr-4 rtl:ml-4 rtl:mr-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-400">WhatsApp</div>
                    <div className="text-sm font-bold text-gray-900">+86 138-0000-0000</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500" />
                </button>

                <button 
                  onClick={() => copyToClipboard('Facebook: ShoeFactory_Official', 'Facebook')}
                  className="flex-1 group flex items-center p-4 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left"
                >
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 mr-4 rtl:ml-4 rtl:mr-0">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-400">Facebook</div>
                    <div className="text-sm font-bold text-gray-900">@ShoeFactory</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                </button>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                <div className="w-10 h-10 bg-white shadow-sm text-gray-600 rounded-lg flex items-center justify-center shrink-0 mr-4 rtl:ml-4 rtl:mr-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t('contact.addressTitle')}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{t('contact.addressDesc')}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </ClientLayout>
  );
}
