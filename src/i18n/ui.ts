import { DEFAULT_LOCALE, type Locale } from './locales';

type UiDictionary = {
  localeReady: boolean;
  siteName: string;
  skipToContent: string;
  nav: {
    catalog: string;
    guides: string;
    news: string;
    tools: string;
    search: string;
    openMenu: string;
    closeMenu: string;
    changeTheme: string;
    lightTheme: string;
    darkTheme: string;
  };
  article: {
    home: string;
    guides: string;
    by: string;
    published: string;
    updated: string;
    minRead: string;
    toc: string;
    faqTitle: string;
    related: string;
    seeMoreIn: string;
    backToTop: string;
    tags: string;
    trustLine: string;
    affiliateDisclosure: string;
  };
  categories: Record<string, string>;
  commerce: {
    viewOnAmazon: string;
    viewOffer: string;
    viewPrice: string;
    searchAmazon: string;
    opensNewTab: string;
    reviewed: string;
    recommended: string;
    topPick: string;
    sortBy: string;
    priceAsc: string;
    priceDesc: string;
    rating: string;
    unavailable: string;
  };
  language: {
    label: string;
    selectorTitle: string;
    suggestion: string;
    switchTo: string;
    stayHere: string;
  };
  footer: {
    categories: string;
    explore: string;
    legal: string;
    allArticles: string;
    about: string;
    editorialMethod: string;
    testingMethod: string;
    privacy: string;
    legalNotice: string;
    cookies: string;
    affiliateNotice: string;
    rights: string;
  };
  cookies: {
    label: string;
    text: string;
    policy: string;
    accept: string;
    reject: string;
  };
};

export const UI = {
  'es-ES': {
    localeReady: true,
    siteName: 'Tu Espacio de Trabajo',
    skipToContent: 'Saltar al contenido',
    nav: {
      catalog: 'Catálogo',
      guides: 'Guías',
      news: 'Actualidad',
      tools: 'Herramientas',
      search: 'Buscar',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      changeTheme: 'Cambiar tema',
      lightTheme: 'Activar modo claro',
      darkTheme: 'Activar modo oscuro',
    },
    article: {
      home: 'Inicio',
      guides: 'Guías',
      by: 'Por',
      published: 'Publicado',
      updated: 'Actualizado',
      minRead: 'min lectura',
      toc: 'En este artículo',
      faqTitle: 'Preguntas frecuentes',
      related: 'Artículos relacionados',
      seeMoreIn: 'Ver más en',
      backToTop: 'Volver arriba',
      tags: 'Etiquetas',
      trustLine: 'Análisis independiente basado en experiencia propia, fichas técnicas verificadas y revisiones periódicas de producto.',
      affiliateDisclosure: 'Este artículo contiene enlaces de afiliados. Si compras a través de ellos podemos recibir una pequeña comisión sin coste adicional para ti.',
    },
    categories: {
      sillas: 'Sillas',
      escritorios: 'Escritorios',
      accesorios: 'Accesorios',
      ambiente: 'Ambiente',
      'audio-video': 'Audio y vídeo',
      guias: 'Guías',
      guides: 'Guías',
    },
    commerce: {
      viewOnAmazon: 'Ver en Amazon',
      viewOffer: 'Ver oferta',
      viewPrice: 'Ver precio',
      searchAmazon: 'Buscar en Amazon',
      opensNewTab: 'se abre en nueva pestaña',
      reviewed: 'Revisado',
      recommended: 'Recomendado',
      topPick: 'Nuestra elección',
      sortBy: 'Ordenar por',
      priceAsc: 'Precio ↑',
      priceDesc: 'Precio ↓',
      rating: 'Valoración',
      unavailable: 'Sin tienda verificada',
    },
    language: {
      label: 'Idioma',
      selectorTitle: 'Cambiar idioma',
      suggestion: 'Esta página está disponible en tu idioma.',
      switchTo: 'Cambiar a',
      stayHere: 'Seguir aquí',
    },
    footer: {
      categories: 'Categorías',
      explore: 'Explorar',
      legal: 'Legal',
      allArticles: 'Todos los artículos',
      about: 'Sobre mí',
      editorialMethod: 'Metodología editorial',
      testingMethod: 'Cómo probamos productos',
      privacy: 'Privacidad',
      legalNotice: 'Aviso legal',
      cookies: 'Cookies',
      affiliateNotice: 'Aviso de afiliados: tuespaciodetrabajo.com participa en el Programa de Afiliados de Amazon EU. Cuando compras a través de nuestros enlaces podemos recibir una comisión sin coste adicional para ti. No aceptamos pagos por colocar productos en una posición concreta.',
      rights: 'Todos los derechos reservados',
    },
    cookies: {
      label: 'Consentimiento de cookies',
      text: 'Usamos cookies analíticas (Google Analytics) para mejorar la web.',
      policy: 'Política de cookies',
      accept: 'Aceptar',
      reject: 'Rechazar',
    },
  },
  en: {
    localeReady: true,
    siteName: 'Tu Espacio de Trabajo',
    skipToContent: 'Skip to content',
    nav: {
      catalog: 'Catalog',
      guides: 'Guides',
      news: 'Updates',
      tools: 'Tools',
      search: 'Search',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      changeTheme: 'Change theme',
      lightTheme: 'Switch to light mode',
      darkTheme: 'Switch to dark mode',
    },
    article: {
      home: 'Home',
      guides: 'Guides',
      by: 'By',
      published: 'Published',
      updated: 'Updated',
      minRead: 'min read',
      toc: 'In this guide',
      faqTitle: 'Frequently asked questions',
      related: 'Related articles',
      seeMoreIn: 'See more in',
      backToTop: 'Back to top',
      tags: 'Tags',
      trustLine: 'Independent analysis based on hands-on experience, verified specs, and regular product checks.',
      affiliateDisclosure: 'This article contains affiliate links. As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.',
    },
    categories: {
      sillas: 'Chairs',
      chairs: 'Chairs',
      escritorios: 'Desks',
      desks: 'Desks',
      accesorios: 'Accessories',
      accessories: 'Accessories',
      ambiente: 'Workspace',
      workspace: 'Workspace',
      'audio-video': 'Audio and video',
      guias: 'Guides',
      guides: 'Guides',
    },
    commerce: {
      viewOnAmazon: 'View on Amazon',
      viewOffer: 'View offer',
      viewPrice: 'Check price',
      searchAmazon: 'Search on Amazon',
      opensNewTab: 'opens in a new tab',
      reviewed: 'Checked',
      recommended: 'Recommended',
      topPick: 'Top pick',
      sortBy: 'Sort by',
      priceAsc: 'Price ↑',
      priceDesc: 'Price ↓',
      rating: 'Rating',
      unavailable: 'No verified store',
    },
    language: {
      label: 'Language',
      selectorTitle: 'Change language',
      suggestion: 'This page is available in your language.',
      switchTo: 'Switch to',
      stayHere: 'Stay here',
    },
    footer: {
      categories: 'Categories',
      explore: 'Explore',
      legal: 'Legal',
      allArticles: 'All articles',
      about: 'About',
      editorialMethod: 'Editorial methodology',
      testingMethod: 'How we evaluate products',
      privacy: 'Privacy',
      legalNotice: 'Legal notice',
      cookies: 'Cookies',
      affiliateNotice: 'Affiliate disclosure: tuespaciodetrabajo.com participates in the Amazon Associates Program. As an Amazon Associate, we earn from qualifying purchases. We do not accept payment to place products in a specific position.',
      rights: 'All rights reserved',
    },
    cookies: {
      label: 'Cookie consent',
      text: 'We use analytics cookies (Google Analytics) to improve the website.',
      policy: 'Cookie policy',
      accept: 'Accept',
      reject: 'Reject',
    },
  },
} satisfies Partial<Record<Locale, UiDictionary>>;

export function t(locale: Locale): UiDictionary {
  return (UI[locale] ?? UI[DEFAULT_LOCALE]) as UiDictionary;
}
