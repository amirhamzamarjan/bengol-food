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
    logoPath: "images/logo2.png"
  },

  // =========================================================================
  // SUPABASE CONFIGURATION
  // (Paste your Supabase credentials here, OR set them via Admin > Settings)
  // =========================================================================
  supabase: {
    url: "",      // e.g. "https://your-project-id.supabase.co"
    anonKey: ""   // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (Public Anon Key)
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
      image: "images/prep/prep-1-quality.jpg",
      fallbackImage: "images/prep/fallback-1.svg",
      alt: "Finely milled whole wheat flour in an artisanal bowl with wheat grains"
    },
    {
      step: "02",
      title: "Traditional Inspiration",
      bengaliTitle: "ঐতিহ্যের ছোঁয়া",
      description: "The preparation experience is rooted in familiar Bangladeshi food traditions and mindful dough preparation.",
      image: "images/prep/prep-2-dough.jpg",
      fallbackImage: "images/prep/fallback-2.svg",
      alt: "Hands kneading fresh, smooth roti dough on a wooden board"
    },
    {
      step: "03",
      title: "Prepared With Care",
      bengaliTitle: "যত্নশীল প্রস্তুতি",
      description: "Each roti and parota is handled with care and attention to consistency, rolled to the perfect delicate thickness.",
      image: "images/prep/prep-3-rolling.jpg",
      fallbackImage: "images/prep/fallback-3.svg",
      alt: "Wooden rolling pin shaping round, authentic flatbread on wooden board"
    },
    {
      step: "04",
      title: "Freshness in Focus",
      bengaliTitle: "তাজা ও গরম",
      description: "Freshness remains an essential part of the customer experience, baked gently to achieve natural tenderness.",
      image: "images/prep/prep-4-cooking.png",
      fallbackImage: "images/prep/fallback-4.svg",
      alt: "Freshly prepared roti gently toasted to golden warmth"
    },
    {
      step: "05",
      title: "Ready for Your Table",
      bengaliTitle: "পরিবারের টেবিলে",
      description: "The finished product is packed with care, preserving softness and warmth for family meals and delivery.",
      image: "images/prep/prep-5-serving.png",
      fallbackImage: "images/prep/fallback-5.svg",
      alt: "Hot fresh stack of rotis nestled in a linen-lined woven basket"
    }
  ],

  // =========================================================================
  // GALLERY ITEMS (Initial set of 8 authentic items, showing 6 initially + Explore More)
  // =========================================================================
  defaultGallery: [
    {
      id: "gal-01",
      title: "Finest Grain Selection",
      description: "Pristine whole wheat and refined flours selected for natural aroma and taste.",
      image_url: "images/prep/prep-1-quality.jpg",
      sort_order: 1,
      is_published: true
    },
    {
      id: "gal-02",
      title: "Gentle Kneading Process",
      description: "Hydrated and kneaded to exact consistency to ensure softness in every bite.",
      image_url: "images/prep/prep-2-dough.jpg",
      sort_order: 2,
      is_published: true
    },
    {
      id: "gal-03",
      title: "Artisanal Rolling Technique",
      description: "Delicate and round flatbreads shaped with traditional hand-guided technique.",
      image_url: "images/prep/prep-3-rolling.jpg",
      sort_order: 3,
      is_published: true
    },
    {
      id: "gal-04",
      title: "Traditional Baking Heat",
      description: "Slow-toasted over controlled flame until naturally puffed and aromatic.",
      image_url: "images/prep/prep-4-cooking.png",
      sort_order: 4,
      is_published: true
    },
    {
      id: "gal-05",
      title: "Fresh Warm Stacks",
      description: "Hot rotis layered carefully to retain moisture and authentic comforting texture.",
      image_url: "images/prep/prep-5-serving.png",
      sort_order: 5,
      is_published: true
    },
    {
      id: "gal-06",
      title: "Wholesome Atta Roti",
      description: "Whole wheat goodness ready to anchor daily breakfast and dinner tables.",
      image_url: "images/ataruti.png",
      sort_order: 6,
      is_published: true
    },
    {
      id: "gal-07",
      title: "Tender Maida Roti",
      description: "Silky, tender white flour roti for effortless folding and pairing.",
      image_url: "images/moydaruti.png",
      sort_order: 7,
      is_published: true
    },
    {
      id: "gal-08",
      title: "Flaky Golden Parota",
      description: "Multi-layered with signature golden crispness outside and tender inside folds.",
      image_url: "images/porota.png",
      sort_order: 8,
      is_published: true
    }
  ],

  // =========================================================================
  // CORE PRODUCTS (Atta Roti, Maida Roti, Parota ONLY)
  // Default price: ৳0.00 until updated in Supabase database / Admin Panel
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
      image_url: "images/ataruti.png",
      gallery_images: [
        "images/ataruti.png",
        "images/prep/prep-5-serving.png",
        "images/prep/prep-4-cooking.png",
        "images/prep/prep-1-quality.jpg"
      ],
      detail_image: "images/prep/prep-5-serving.png",
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
      image_url: "images/moydaruti.png",
      gallery_images: [
        "images/moydaruti.png",
        "images/prep/prep-3-rolling.jpg",
        "images/prep/prep-2-dough.jpg",
        "images/prep/prep-4-cooking.png"
      ],
      detail_image: "images/prep/prep-3-rolling.jpg",
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
      image_url: "images/porota.png",
      gallery_images: [
        "images/porota.png",
        "images/prep/prep-4-cooking.png",
        "images/prep/prep-2-dough.jpg",
        "images/prep/prep-5-serving.png"
      ],
      detail_image: "images/prep/prep-4-cooking.png",
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
