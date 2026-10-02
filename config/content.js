/**
 * US BENGOL - Central Configuration & Content Dictionary
 * 
 * All preparation photographs, brand copy, contact details,
 * and core product definitions are centralized here.
 * 
 * To replace preparation photos later with custom studio photography,
 * simply change the paths/URLs assigned to TEMP_PREP_IMAGE_01 through 05 below.
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
    logoPath: "images/logo.png"
  },

  // =========================================================================
  // SECTION 20 & 54: HOW WE PREPARE - TEMPORARY PHOTOGRAPHY CONFIGURATION
  // Replace these references with your permanent studio photos whenever ready.
  // =========================================================================
  preparation: [
    {
      step: "01",
      title: "Quality Comes First",
      bengaliTitle: "উপাদান নির্বাচন",
      description: "Materials and preparation are handled with attention to quality, starting with pristine, wholesome grains.",
      // TEMP_PREP_IMAGE_01
      image: "images/prep/prep-1-quality.jpg",
      fallbackImage: "images/prep/fallback-1.svg",
      alt: "Finely milled whole wheat flour in an artisanal bowl with wheat grains"
    },
    {
      step: "02",
      title: "Traditional Inspiration",
      bengaliTitle: "ঐতিহ্যের ছোঁয়া",
      description: "The preparation experience is rooted in familiar Bangladeshi food traditions and mindful dough preparation.",
      // TEMP_PREP_IMAGE_02
      image: "images/prep/prep-2-dough.jpg",
      fallbackImage: "images/prep/fallback-2.svg",
      alt: "Hands kneading fresh, smooth roti dough on a wooden board"
    },
    {
      step: "03",
      title: "Prepared With Care",
      bengaliTitle: "যত্নশীল প্রস্তুতি",
      description: "Each roti and parota is handled with care and attention to consistency, rolled to the perfect delicate thickness.",
      // TEMP_PREP_IMAGE_03
      image: "images/prep/prep-3-rolling.jpg",
      fallbackImage: "images/prep/fallback-3.svg",
      alt: "Wooden rolling pin shaping round, authentic flatbread on wooden board"
    },
    {
      step: "04",
      title: "Freshness in Focus",
      bengaliTitle: "তাজা ও গরম",
      description: "Freshness remains an essential part of the customer experience, baked gently to achieve natural tenderness.",
      // TEMP_PREP_IMAGE_04
      image: "images/prep/prep-4-cooking.png",
      fallbackImage: "images/prep/fallback-4.svg",
      alt: "Freshly prepared roti gently toasted to golden warmth"
    },
    {
      step: "05",
      title: "Ready for Your Table",
      bengaliTitle: "পরিবারের টেবিলে",
      description: "The finished product is packed with care, preserving softness and warmth for family meals and delivery.",
      // TEMP_PREP_IMAGE_05
      image: "images/prep/prep-5-serving.png",
      fallbackImage: "images/prep/fallback-5.svg",
      alt: "Hot fresh stack of rotis nestled in a linen-lined woven basket"
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
      badge: "Morning Classic",
      is_available: true,
      is_visible: true,
      sort_order: 3,
      nutritionNotes: "Hand-folded and layered for authentic texture and golden crispness."
    }
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
      subtitle: "সারা দেশে পৌঁছে দেওয়া",
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
