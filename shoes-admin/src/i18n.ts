import { computed, ref } from 'vue';

export const languages = {
  zh: "中文",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어"
};

export type LanguageCode = keyof typeof languages;

export const translations = {
  zh: {
    nav: { home: "首页", products: "产品列表", contact: "联系我们" },
    home: {
      direct: "Shoe Factory Direct",
      slogan1: "我们是鞋子工厂，",
      slogan2: "一双也能为你做。",
      serve: "我们竭诚服务于",
      buyers: ["个人买家", "采购商", "创业者(电商/实体)"],
      searchPlaceholder: "搜索产品货号ID (例如: SHOE-10001)...",
      searchAction: "搜索",
      featuredProducts: "精选产品",
      viewDetails: "浏览详情",
      viewAll: "查看所有产品",
    },
    categories: { c1: "运动鞋", c2: "户外鞋", c3: "凉鞋", c4: "休闲鞋", c5: "皮鞋" },
    products: {
      all: "全部",
      allProducts: "所有产品",
      foundProducts: "共找到 {count} 款产品",
      searchPlaceholder: "搜索货号...",
      searchResults: "搜索结果: {query}",
      noProducts: "未找到产品",
      tryAnother: "尝试换一个关键词或类别重新搜索",
      newProduct: "2026新款 {cat} {style}"
    },
    product: {
      back: "返回产品列表",
      notFound: "产品未找到",
      price: "订购参考价",
      stockStatus: "现货状态",
      inStock: "充足 (现货秒发)",
      outOfStock: "需下单定制",
      desc: "这款鞋子采用了最新科技材料，具有出色的透气与耐磨特性，工厂直销，品质保证。无论是日常穿搭还是特种场合都能完美胜任。一双起订，量大从优。",
      contactTip: "提供货号以便快速询盘",
      copyWhatsapp: "点击复制 WhatsApp 询盘",
      copyFacebook: "点击复制 Facebook 联系方式",
    },
    contact: {
      title1: "制造好鞋",
      title2: "连接世界",
      aboutUs: "关于我们",
      subtitle1: "我们位于中国泉州",
      subtitle2: "全球强大的鞋类产业带。",
      p1: "任何鞋子我们都能快速开发出来。无论您是订购一双，或者1万双，我们都会提供无差别的顶级服务。",
      p2: "如果您是创业者或采购商，我们将提供最实惠的出厂价格，以及最严苛的质量把控体系。让您在前线销售无忧。",
      feature1Title: "源头工厂",
      feature1Desc: "砍掉所有中间商环节",
      feature2Title: "全球发货",
      feature2Desc: "支持一件代发全球",
      addressTitle: "公司地址",
      addressDesc: "中国福建省泉州市晋江市鞋都核心开发区",
      fastContact: "快速联系方式 (点击复制)"
    },
    admin: { goBack: "返回官网", system: "后台管理系统", productsManagement: "产品管理" }
  },
  en: {
    nav: { home: "Home", products: "Products", contact: "Contact Us" },
    home: {
      direct: "Shoe Factory Direct",
      slogan1: "We are a shoe factory,",
      slogan2: "we can make even one pair for you.",
      serve: "We proudly serve",
      buyers: ["Individual Buyers", "Purchasers", "Entrepreneurs"],
      searchPlaceholder: "Search product ID (e.g. SHOE-10001)...",
      searchAction: "Search",
      featuredProducts: "Featured Products",
      viewDetails: "View Details",
      viewAll: "View All Products",
    },
    categories: { c1: "Sneakers", c2: "Outdoor", c3: "Sandals", c4: "Casual", c5: "Leather" },
    products: {
      all: "All",
      allProducts: "All Products",
      foundProducts: "Found {count} products",
      searchPlaceholder: "Search ID...",
      searchResults: "Search results for: {query}",
      noProducts: "Product not found",
      tryAnother: "Try searching with a different keyword or category",
      newProduct: "2026 New {cat} {style}"
    },
    product: {
      back: "Back to Products",
      notFound: "Product not found",
      price: "Reference Price",
      stockStatus: "Stock Status",
      inStock: "In Stock (Ready to ship)",
      outOfStock: "Made to order",
      desc: "These shoes feature the latest tech materials with excellent breathability and durability. Factory direct sales guarantee quality. Whether for daily wear or special occasions, they are a perfect fit. Order starting from one pair, with discounts for large quantities.",
      contactTip: "Provide the product ID for a quick inquiry",
      copyWhatsapp: "Click to copy WhatsApp for inquiry",
      copyFacebook: "Click to copy Facebook contact",
    },
    contact: {
      title1: "Making Great Shoes",
      title2: "Connecting the World",
      aboutUs: "About Us",
      subtitle1: "We are located in Quanzhou, China",
      subtitle2: "A powerful global footwear industrial belt.",
      p1: "We can quickly develop any shoe. Whether you order one pair or 10,000 pairs, we provide the same top-tier service.",
      p2: "If you are an entrepreneur or purchaser, we will provide the most affordable factory prices and the strictest quality control system, giving you peace of mind in your frontline sales.",
      feature1Title: "Source Factory",
      feature1Desc: "Cut out all middlemen",
      feature2Title: "Global Shipping",
      feature2Desc: "Support dropshipping worldwide",
      addressTitle: "Company Address",
      addressDesc: "Shoe Capital Core Development Zone, Jinjiang City, Quanzhou City, Fujian Province, China",
      fastContact: "Quick Contact (Click to copy)"
    },
    admin: { goBack: "Back to Website", system: "Admin System", productsManagement: "Products Management" }
  },
  es: {
    nav: { home: "Inicio", products: "Productos", contact: "Contáctenos" },
    home: {
      direct: "Fábrica de Zapatos Directa",
      slogan1: "Somos una fábrica de zapatos,",
      slogan2: "podemos hacer incluso un par para ti.",
      serve: "Servimos a",
      buyers: ["Compradores", "Mayoristas", "Emprendedores"],
      searchPlaceholder: "Buscar ID (ej. SHOE-10001)...",
      searchAction: "Buscar",
      featuredProducts: "Destacados",
      viewDetails: "Detalles",
      viewAll: "Ver Todos",
    },
    categories: { c1: "Deportivos", c2: "Al aire libre", c3: "Sandalias", c4: "Casual", c5: "Cuero" },
    products: {
      all: "Todos",
      allProducts: "Todos los Productos",
      foundProducts: "Se encontraron {count} productos",
      searchPlaceholder: "Buscar ID...",
      searchResults: "Resultados: {query}",
      noProducts: "No encontrado",
      tryAnother: "Intente con otra palabra clave",
      newProduct: "Nuevo 2026 {cat} {style}"
    },
    product: {
      back: "Volver",
      notFound: "No encontrado",
      price: "Precio Referencia",
      stockStatus: "Stock",
      inStock: "En Stock",
      outOfStock: "Bajo pedido",
      desc: "Zapatos con tecnología de última generación. Transpirables y duraderos.",
      contactTip: "Indique el ID del producto",
      copyWhatsapp: "Copiar WhatsApp",
      copyFacebook: "Copiar Facebook",
    },
    contact: {
      title1: "Los Mejores Zapatos",
      title2: "Conectando al Mundo",
      aboutUs: "Sobre Nosotros",
      subtitle1: "Situados en Quanzhou, China",
      subtitle2: "El cinturón industrial más grande.",
      p1: "Desarrollamos cualquier estilo rápidamente. Desde 1 par hasta 10,000.",
      p2: "Precios directos de fábrica. Calidad garantizada.",
      feature1Title: "Fábrica de Origen",
      feature1Desc: "Sin intermediarios",
      feature2Title: "Envío Global",
      feature2Desc: "Soporte de Dropshipping",
      addressTitle: "Dirección",
      addressDesc: "Quanzhou, Fujian, China",
      fastContact: "Contacto Rápido"
    },
    admin: { goBack: "Volver", system: "Administración", productsManagement: "Productos" }
  },
  fr: {
    nav: { home: "Accueil", products: "Produits", contact: "Contact" },
    home: {
      direct: "En Direct de l'Usine",
      slogan1: "Nous sommes une usine,",
      slogan2: "nous pouvons fabriquer même une paire.",
      serve: "Nous servons",
      buyers: ["Particuliers", "Acheteurs", "Entrepreneurs"],
      searchPlaceholder: "ID de produit...",
      searchAction: "Recherche",
      featuredProducts: "En Vedette",
      viewDetails: "Détails",
      viewAll: "Voir Tout",
    },
    categories: { c1: "Baskets", c2: "Extérieur", c3: "Sandales", c4: "Décontractées", c5: "Cuir" },
    products: {
      all: "Tout",
      allProducts: "Tous les Produits",
      foundProducts: "{count} produits trouvés",
      searchPlaceholder: "Rechercher l'ID...",
      searchResults: "Résultats: {query}",
      noProducts: "Aucun produit trouvé",
      tryAnother: "Essayez un autre mot-clé",
      newProduct: "Nouveau 2026 {cat} {style}"
    },
    product: {
      back: "Retour",
      notFound: "Introuvable",
      price: "Prix de référence",
      stockStatus: "Disponibilité",
      inStock: "En Stock",
      outOfStock: "Sur Commande",
      desc: "Nouvelle technologie, respirant, durable. Vente directe d'usine.",
      contactTip: "Fournir l'ID du produit",
      copyWhatsapp: "Copier WhatsApp",
      copyFacebook: "Copier Facebook",
    },
    contact: {
      title1: "Belles Chaussures",
      title2: "Monde Connecté",
      aboutUs: "À Propos",
      subtitle1: "Situé à Quanzhou, Chine",
      subtitle2: "Le centre de la chaussure.",
      p1: "Production rapide. 1 paire ou 10 000.",
      p2: "Prix d'usine, contrôle qualité strict.",
      feature1Title: "Usine Source",
      feature1Desc: "Pas d'intermédiaire",
      feature2Title: "Expédition Mondiale",
      feature2Desc: "Dropshipping supporté",
      addressTitle: "Adresse",
      addressDesc: "Quanzhou, Fujian, Chine",
      fastContact: "Contact Rapide"
    },
    admin: { goBack: "Retour", system: "Admin", productsManagement: "Produits" }
  },
  de: {
    nav: { home: "Startseite", products: "Produkte", contact: "Kontakt" },
    home: {
      direct: "Fabrik direkt",
      slogan1: "Wir sind eine Schuhfabrik,",
      slogan2: "wir machen auch nur ein Paar.",
      serve: "Wir bedienen",
      buyers: ["Käufer", "Einkäufer", "Unternehmer"],
      searchPlaceholder: "Produkt ID suchen...",
      searchAction: "Suche",
      featuredProducts: "Ausgewählt",
      viewDetails: "Details anzeigen",
      viewAll: "Alle Produkte",
    },
    categories: { c1: "Sneakers", c2: "Outdoor", c3: "Sandalen", c4: "Freizeit", c5: "Leder" },
    products: {
      all: "Alle",
      allProducts: "Alle Produkte",
      foundProducts: "{count} Produkte gefunden",
      searchPlaceholder: "ID suchen...",
      searchResults: "Ergebnisse: {query}",
      noProducts: "Kein Produkt",
      tryAnother: "Versuchen Sie ein anderes Schlüsselwort",
      newProduct: "Neu 2026 {cat} {style}"
    },
    product: {
      back: "Zurück",
      notFound: "Nicht gefunden",
      price: "Preis",
      stockStatus: "Lagerbestand",
      inStock: "Auf Lager",
      outOfStock: "Auf Bestellung",
      desc: "Hohe Qualität, atmungsaktiv, langlebig. Fabrikdirektverkauf.",
      contactTip: "Geben Sie die ID an",
      copyWhatsapp: "WhatsApp kopieren",
      copyFacebook: "Facebook kopieren",
    },
    contact: {
      title1: "Beste Schuhe",
      title2: "Weltweit verbunden",
      aboutUs: "Über uns",
      subtitle1: "Wir sind in Quanzhou, China",
      subtitle2: "Das Zentrum der Schuhindustrie.",
      p1: "Schnelle Produktion. Ab 1 Paar.",
      p2: "Günstige Fabrikpreise, strenge Qualitätskontrolle.",
      feature1Title: "Direktfabrik",
      feature1Desc: "Keine Zwischenhändler",
      feature2Title: "Weltweiter Versand",
      feature2Desc: "Dropshipping weltweit",
      addressTitle: "Adresse",
      addressDesc: "Quanzhou, Fujian, China",
      fastContact: "Schnellkontakt"
    },
    admin: { goBack: "Zurück", system: "Admin System", productsManagement: "Produkte" }
  },
  ar: {
    nav: { home: "الرئيسية", products: "المنتجات", contact: "اتصل بنا" },
    home: {
      direct: "من المصنع مباشرة",
      slogan1: "نحن مصنع أحذية،",
      slogan2: "نصنع لك حتى زوجاً واحداً.",
      serve: "نحن نخدم",
      buyers: ["المشترين الأفراد", "المشترين", "رواد الأعمال"],
      searchPlaceholder: "ابحث عن رقم المنتج...",
      searchAction: "بحث",
      featuredProducts: "منتجات مميزة",
      viewDetails: "عرض التفاصيل",
      viewAll: "عرض كل المنتجات",
    },
    categories: { c1: "أحذية رياضية", c2: "خارجي", c3: "صنادل", c4: "كاجوال", c5: "جلد" },
    products: {
      all: "الكل",
      allProducts: "كل المنتجات",
      foundProducts: "تم العثور على {count}",
      searchPlaceholder: "بحث عن رقم...",
      searchResults: "نتائج البحث: {query}",
      noProducts: "لم يتم العثور",
      tryAnother: "جرب كلمة أخرى",
      newProduct: "جديد 2026 {cat} {style}"
    },
    product: {
      back: "عودة",
      notFound: "غير موجود",
      price: "السعر",
      stockStatus: "حالة المخزون",
      inStock: "متوفر",
      outOfStock: "حسب الطلب",
      desc: "تقنية جديدة، بيع مباشر من المصنع.",
      contactTip: "قدم رقم المنتج",
      copyWhatsapp: "نسخ واتساب",
      copyFacebook: "نسخ فيسبوك",
    },
    contact: {
      title1: "نصنع أحذية جيدة",
      title2: "ونربط العالم",
      aboutUs: "معلومات عنا",
      subtitle1: "مقرنا في تشيوانتشو، الصين",
      subtitle2: "حزام صناعة الأحذية العالمي.",
      p1: "تطوير سريع. زوج واحد أو 10,000.",
      p2: "أفضل أسعار المصنع، رقابة الجودة.",
      feature1Title: "مصنع المصدر",
      feature1Desc: "بدون وسطاء",
      feature2Title: "شحن عالمي",
      feature2Desc: "شحن مباشر",
      addressTitle: "العنوان",
      addressDesc: "تشيوانتشو، فوجيان، الصين",
      fastContact: "اتصال سريع"
    },
    admin: { goBack: "عودة", system: "الإدارة", productsManagement: "إدارة المنتجات" }
  },
  ru: {
    nav: { home: "Главная", products: "Продукты", contact: "Контакты" },
    home: {
      direct: "Прямо с завода",
      slogan1: "Мы - обувной завод,",
      slogan2: "можем сделать даже одну пару.",
      serve: "Мы служим",
      buyers: ["Индивидуальные покупатели", "Закупщики", "Предприниматели"],
      searchPlaceholder: "Поиск ID продукта...",
      searchAction: "Поиск",
      featuredProducts: "Популярные",
      viewDetails: "Подробнее",
      viewAll: "Все продукты",
    },
    categories: { c1: "Кроссовки", c2: "На открытом воздухе", c3: "Сандалии", c4: "Повседневная", c5: "Кожаные" },
    products: {
      all: "Все",
      allProducts: "Все продукты",
      foundProducts: "Найдено {count} шт.",
      searchPlaceholder: "Поиск ID...",
      searchResults: "Результаты: {query}",
      noProducts: "Не найдено",
      tryAnother: "Попробуйте другое слово",
      newProduct: "Новинка 2026 {cat} {style}"
    },
    product: {
      back: "Назад",
      notFound: "Не найдено",
      price: "Цена",
      stockStatus: "Наличие",
      inStock: "В наличии",
      outOfStock: "На заказ",
      desc: "Новые технологии. Прямые поставки.",
      contactTip: "Укажите ID продукта",
      copyWhatsapp: "Копировать WhatsApp",
      copyFacebook: "Копировать Facebook",
    },
    contact: {
      title1: "Хорошая обувь",
      title2: "Связывает мир",
      aboutUs: "О нас",
      subtitle1: "Мы находимся в Цюаньчжоу, Китай",
      subtitle2: "Глобальный центр обуви.",
      p1: "Быстрая разработка. От 1 до 10 000 пар.",
      p2: "Заводские цены, строгий контроль качества.",
      feature1Title: "Прямой завод",
      feature1Desc: "Без посредников",
      feature2Title: "Глобальная доставка",
      feature2Desc: "Поддержка дропшиппинга",
      addressTitle: "Адрес",
      addressDesc: "Цюаньчжоу, Фуцзянь, Китай",
      fastContact: "Быстрая связь"
    },
    admin: { goBack: "Назад", system: "Админка", productsManagement: "Товары" }
  },
  ja: {
    nav: { home: "ホーム", products: "製品リスト", contact: "お問い合わせ" },
    home: {
      direct: "工場直販",
      slogan1: "私たちは靴工場です、",
      slogan2: "1足からでもお作りします。",
      serve: "対象のお客様",
      buyers: ["個人購入者", "バイヤー", "起業家"],
      searchPlaceholder: "製品IDを検索...",
      searchAction: "検索",
      featuredProducts: "おすすめ商品",
      viewDetails: "詳細を見る",
      viewAll: "すべての商品を見る",
    },
    categories: { c1: "スニーカー", c2: "アウトドア", c3: "サンダル", c4: "カジュアル", c5: "レザー" },
    products: {
      all: "すべて",
      allProducts: "すべての商品",
      foundProducts: "{count}件見つかりました",
      searchPlaceholder: "IDを検索...",
      searchResults: "検索結果: {query}",
      noProducts: "見つかりません",
      tryAnother: "別のキーワードをお試しください",
      newProduct: "2026新作 {cat} {style}"
    },
    product: {
      back: "戻る",
      notFound: "見つかりません",
      price: "参考価格",
      stockStatus: "在庫状況",
      inStock: "在庫あり",
      outOfStock: "受注生産",
      desc: "最新のテクノロジー素材。工場直販、品質保証。",
      contactTip: "製品IDを提供して迅速な問い合わせ",
      copyWhatsapp: "WhatsAppをコピー",
      copyFacebook: "Facebookをコピー",
    },
    contact: {
      title1: "良い靴を作り",
      title2: "世界を繋ぐ",
      aboutUs: "私たちについて",
      subtitle1: "中国泉州市に位置し",
      subtitle2: "世界最大の靴産業地帯です。",
      p1: "どんな靴でも迅速に開発します。1足でも1万足でも。",
      p2: "工場直販の価格と厳格な品質管理を提供します。",
      feature1Title: "工場直販",
      feature1Desc: "中間業者なし",
      feature2Title: "グローバル発送",
      feature2Desc: "ドロップシッピング対応",
      addressTitle: "会社住所",
      addressDesc: "中国福建省泉州市",
      fastContact: "クイックコンタクト"
    },
    admin: { goBack: "戻る", system: "管理システム", productsManagement: "製品管理" }
  },
  ko: {
    nav: { home: "홈", products: "제품", contact: "연락처" },
    home: {
      direct: "공장 직거래",
      slogan1: "우리는 신발 공장입니다,",
      slogan2: "한 켤레도 만들어 드립니다.",
      serve: "서비스 대상",
      buyers: ["개인 구매자", "바이어", "창업자"],
      searchPlaceholder: "제품 ID 검색...",
      searchAction: "검색",
      featuredProducts: "추천 상품",
      viewDetails: "자세히 보기",
      viewAll: "모든 상품 보기",
    },
    categories: { c1: "스니커즈", c2: "아웃도어", c3: "샌들", c4: "캐주얼", c5: "가죽" },
    products: {
      all: "전체",
      allProducts: "모든 제품",
      foundProducts: "{count}개 발견",
      searchPlaceholder: "ID 검색...",
      searchResults: "검색 결과: {query}",
      noProducts: "찾을 수 없음",
      tryAnother: "다른 키워드를 시도하십시오",
      newProduct: "2026 신제품 {cat} {style}"
    },
    product: {
      back: "돌아가기",
      notFound: "찾을 수 없음",
      price: "참고 가격",
      stockStatus: "재고 상태",
      inStock: "재고 있음",
      outOfStock: "주문 제작",
      desc: "최신 기술 소재 사용. 공장 직영, 품질 보장.",
      contactTip: "제품 ID를 제공하십시오",
      copyWhatsapp: "WhatsApp 복사",
      copyFacebook: "Facebook 복사",
    },
    contact: {
      title1: "좋은 신발 만들기",
      title2: "세계 연결",
      aboutUs: "우리에 대해",
      subtitle1: "중국 취안저우 소재",
      subtitle2: "세계적인 신발 산업 벨트.",
      p1: "모든 신발을 빠르게 개발할 수 있습니다. 1켤레든 1만 켤레든.",
      p2: "공장 직거래 가격과 엄격한 품질 관리 제공.",
      feature1Title: "직영 공장",
      feature1Desc: "중간 상인 없음",
      feature2Title: "글로벌 배송",
      feature2Desc: "전 세계 드롭쉬핑 지원",
      addressTitle: "주소",
      addressDesc: "중국 푸젠성 취안저우시",
      fastContact: "빠른 연락"
    },
    admin: { goBack: "돌아가기", system: "관리 시스템", productsManagement: "제품 관리" }
  }
} as const;

const applyRtl = (l: string) => {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = l;
};

const initialLang = (() => {
  if (typeof localStorage === 'undefined') {
    return 'zh';
  }
  const saved = localStorage.getItem('appLang') as LanguageCode | null;
  return saved && languages[saved] ? saved : 'zh';
})();

const lang = ref<LanguageCode>(initialLang);
applyRtl(lang.value);

const setLang = (newLang: LanguageCode) => {
  lang.value = newLang;
  localStorage.setItem('appLang', newLang);
  applyRtl(newLang);
};

const t = (path: string, params?: Record<string, string | number>) => {
  const keys = path.split('.');
  let current: any = translations[lang.value];
  for (const key of keys) {
    if (!current || current[key] === undefined) {
      return path;
    }
    current = current[key];
  }

  if (typeof current === 'string' && params) {
    let result = current;
    Object.entries(params).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
    });
    return result;
  }
  return current;
};

export function useLanguage() {
  return {
    lang,
    setLang,
    t,
    langObj: computed(() => translations[lang.value]),
  };
}
