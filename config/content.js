/**
 * US BENGOL - Central Configuration & Content Dictionary (v2)
 * 
 * All preparation photographs, brand copy, contact details,
 * and core product definitions are centralized here.
 * 
 * v2: Updated logo to logo2.png, added production captions, certifications config
 */

window.US_BENGOL_CONFIG = {
  brand: {
    name: "US BENGOL",
    tagline: "The familiar taste of home, presented beautifully.",
    bengaliTagline: "ঘরের স্বাদ",
    secondaryBengaliTagline: "প্রতিদিনের পরিচিত স্বাদ",
    phoneDisplay: "+880 1000-000000",
    whatsappNumber: "8801000000000", // E.164 format without '+'
    factoryAddress: "Ullapara, Sirajganj, Bangladesh",
    dispatchAddress: "Bawgan, Uttarkhan, Dhaka 1230, Bangladesh",
    address: "Kitchen: Ullapara, Sirajganj | Dispatch: Uttarkhan, Dhaka",
    deliveryScope: "Nationwide across Bangladesh",
    logoPath: "images/usbengolfood.png"
  },

  // =========================================================================
  // SUPABASE CONFIGURATION
  // (Paste your Supabase credentials here, OR set them via Admin > Settings)
  // =========================================================================
  supabase: {
    url: "https://xnoveggueuxvwzmlnidk.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhub3ZlZ2d1ZXV4dnd6bWxuaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTE3MTQsImV4cCI6MjEwODU4NzcxNH0.ZsyLL86kleZTBYJpDLBtQy7WSgbPls_L7EN4tzLrSNc"
  },

  // =========================================================================
  // CERTIFICATIONS (Placeholder until real cert details are provided)
  // =========================================================================
  certifications: {
    bsti: {
      title: "BSTI Approved",
      description: "Bangladesh Standards and Testing Institution approval for food safety and quality standards compliance.",
      certificateNumber: "",
      status: "placeholder"
    },
    ifst: {
      title: "IFST Recognized",
      description: "Institute of Food Science and Technology recognition for hygienic food production practices.",
      certificateNumber: "",
      status: "placeholder"
    }
  },

  // =========================================================================
  // PRODUCTION JOURNEY - Video Captions (synced to scroll progress)
  // These timestamps are relative percentages (0-100) of video duration
  // =========================================================================
  productionCaptions: [
    {
      startPercent: 0,
      endPercent: 18,
      title: "Premium Ingredients",
      bengaliTitle: "উন্নত উপাদান",
      description: "Carefully selected flour, the foundation of every authentic roti and parota."
    },
    {
      startPercent: 18,
      endPercent: 36,
      title: "Into the Machine",
      bengaliTitle: "যন্ত্রে প্রবেশ",
      description: "Flour enters our production line, beginning the transformation into dough."
    },
    {
      startPercent: 36,
      endPercent: 54,
      title: "Dough Preparation",
      bengaliTitle: "ময়দা প্রস্তুতি",
      description: "Careful mixing and kneading to achieve the perfect consistency and texture."
    },
    {
      startPercent: 54,
      endPercent: 72,
      title: "Cooking & Shaping",
      bengaliTitle: "রান্না ও আকৃতি",
      description: "Traditional cooking techniques bring warmth and golden perfection to every piece."
    },
    {
      startPercent: 72,
      endPercent: 88,
      title: "Quality Assurance",
      bengaliTitle: "মান নিয়ন্ত্রণ",
      description: "Every batch is checked for consistency, freshness, and quality standards."
    },
    {
      startPercent: 88,
      endPercent: 100,
      title: "Sealed & Packaged",
      bengaliTitle: "প্যাকেজিং",
      description: "Hygienically sealed to preserve freshness from our kitchen to your table."
    }
  ],

  // =========================================================================
  // HOW WE PREPARE - PHOTOGRAPHY CONFIGURATION
  // Replace with permanent studio photos when available
  // =========================================================================
  preparation: [
    {
      step: "01",
      title: "Quality Comes First",
      bengaliTitle: "উপাদান নির্বাচন",
      description: "Materials and preparation are handled with attention to quality, starting with pristine, wholesome grains.",
      image: "",
      fallbackImage: "",
      alt: "Quality grain selection"
    },
    {
      step: "02",
      title: "Traditional Inspiration",
      bengaliTitle: "ঐতিহ্যের ছোঁয়া",
      description: "The preparation experience is rooted in familiar Bangladeshi food traditions and mindful dough preparation.",
      image: "",
      fallbackImage: "",
      alt: "Gentle dough kneading"
    },
    {
      step: "03",
      title: "Prepared With Care",
      bengaliTitle: "যত্নশীল প্রস্তুতি",
      description: "Each roti and parota is handled with care and attention to consistency, rolled to the perfect delicate thickness.",
      image: "",
      fallbackImage: "",
      alt: "Delicate rolling technique"
    },
    {
      step: "04",
      title: "Freshness in Focus",
      bengaliTitle: "তাজা ও গরম",
      description: "Freshness remains an essential part of the customer experience, baked gently to achieve natural tenderness.",
      image: "",
      fallbackImage: "",
      alt: "Traditional baking heat"
    },
    {
      step: "05",
      title: "Ready for Your Table",
      bengaliTitle: "পরিবারের টেবিলে",
      description: "The finished product is packed with care, preserving softness and warmth for family meals and delivery.",
      image: "",
      fallbackImage: "",
      alt: "Fresh warm stacks ready for table"
    }
  ],

  // =========================================================================
  // GALLERY ITEMS
  // Clean empty state — Upload all photos fresh from Admin > Gallery
  // =========================================================================
  defaultGallery: [],

  // =========================================================================
  // CORE PRODUCTS (Atta Roti, Maida Roti, Parota)
  // Upload images and set prices via Admin Panel > Products
  // =========================================================================
  defaultProducts: [
    {
      id: "prod-atta-roti",
      name: "Atta Roti",
      bengaliName: "আটা রুটি",
      slug: "atta-roti",
      description: "Wholesome, soft, and puffed whole wheat roti made with traditional care. A daily staple that feels naturally comforting, wholesome, and familiar at every family breakfast and dinner table.",
      shortDescription: "Soft, puffed, whole wheat everyday roti made with traditional care.",
      price: 0.00,
      image_url: "",
      gallery_images: [],
      detail_image: "",
      badge: "Everyday Staple",
      is_available: true,
      is_visible: true,
      sort_order: 1,
      nutritionNotes: "Mindfully prepared whole wheat flatbread, high in natural grain dietary fiber."
    },
    {
      id: "prod-maida-roti",
      name: "Maida Roti",
      bengaliName: "ময়দা রুটি",
      slug: "maida-roti",
      description: "Delicate, tender white-flour roti with a smooth, pliable texture. Thoughtfully rolled and cooked for effortless rolling, dipping, and pairing with savory curries and dal.",
      shortDescription: "Delicate, smooth, and tender flatbread with an airy, pliable crumb.",
      price: 0.00,
      image_url: "",
      gallery_images: [],
      detail_image: "",
      badge: "Traditional Soft",
      is_available: true,
      is_visible: true,
      sort_order: 2,
      nutritionNotes: "Crafted for a light, delicate mouthfeel and gentle warmth."
    },
    {
      id: "prod-parota",
      name: "Parota",
      bengaliName: "পরোটা",
      slug: "parota",
      description: "Traditional flaky layered parota with signature golden crispness outside and soft, tender multi-folds inside. Brings authentic morning nostalgia to your breakfast plate.",
      shortDescription: "Multi-layered, flaky, golden traditional parota with tender folds.",
      price: 0.00,
      image_url: "",
      gallery_images: [],
      detail_image: "",
      badge: "Morning Classic",
      is_available: true,
      is_visible: true,
      sort_order: 3,
      nutritionNotes: "Hand-folded and layered for authentic texture and golden crispness."
    }
  ],

  // =========================================================================
  // NAVIGATION SECTIONS (for pill nav)
  // =========================================================================
  navSections: [
    { id: 'hero', label: 'Home', icon: 'home' },
    { id: 'certifications', label: 'BSTI Standards', icon: 'shield' },
    { id: 'products', label: 'Products', icon: 'package' },
    { id: 'production-story', label: 'How We Prepare', icon: 'film' },
    { id: 'gallery', label: 'Gallery', icon: 'image' },
    { id: 'story', label: 'Heritage', icon: 'book' },
    { id: 'delivery', label: 'Delivery', icon: 'truck' },
    { id: 'contact', label: 'Contact', icon: 'phone' }
  ],

  // Brand Pillars
  whyUsPillars: [
    {
      number: "01",
      title: "Traditional at Heart",
      subtitle: "ঐতিহ্যের শিকড়",
      description: "Inspired by familiar Bangladeshi culinary traditions, capturing the authentic texture and warmth of home kitchens."
    },
    {
      number: "02",
      title: "Made with Care",
      subtitle: "যত্নশীল কারিগর",
      description: "Prepared with rigorous attention to clean ingredients, consistent sizing, and unhurried craftsmanship."
    },
    {
      number: "03",
      title: "Everyday Comfort",
      subtitle: "সহজ তৃপ্তি",
      description: "Honest, reliable food created for everyday breakfast tables, family dinners, and peaceful routine meals."
    },
    {
      number: "04",
      title: "Delivered Nationwide",
      subtitle: "সারা দেশে পৌঁছে দেওয়া",
      description: "Crafted at our production kitchen in Ullapara, Sirajganj and dispatched via our central Dhaka hub, our supply reaches homes, restaurants, and institutions across Bangladesh."
    }
  ],

  // Bulk Order Audience Categories
  bulkAudiences: [
    "Restaurants & Cafés",
    "Hotels & Guest Houses",
    "Catering & Banquet Services",
    "Corporate & Tech Offices",
    "Educational Institutions & Hostels",
    "Family Events & Celebrations",
    "Retail & Grocery Outlets",
    "Community Organizations"
  ]
};
