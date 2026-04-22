export interface IndustryQuestion {
  key: string
  label: string
  type: 'select' | 'multi_select' | 'text' | 'toggle' | 'chips'
  options?: string[]
  placeholder?: string
  helpText?: string
  required?: boolean
}

export const INDUSTRY_QUESTIONS: Record<string, IndustryQuestion[]> = {
  real_estate: [
    {
      key: 'project_type',
      label: 'What type of properties do you deal in?',
      type: 'multi_select',
      options: ['Residential Apartments', 'Villas & Bungalows', 'Plots & Land', 'Commercial Offices', 'Retail Shops', 'Warehouses'],
      required: true,
    },
    {
      key: 'buyer_type',
      label: 'Who is your primary buyer?',
      type: 'select',
      options: ['First-time homebuyers', 'Upgraders / HNI', 'Investors', 'NRI buyers', 'Commercial tenants'],
    },
    {
      key: 'price_range',
      label: 'Typical price range',
      type: 'select',
      options: ['Under ₹30 Lakhs', '₹30–60 Lakhs', '₹60L–1 Cr', '₹1–3 Cr', '₹3 Cr+'],
    },
    {
      key: 'rera_registered',
      label: 'Are your projects RERA registered?',
      type: 'toggle',
    },
    {
      key: 'usp',
      label: 'Your project USPs (select all that apply)',
      type: 'chips',
      options: ['Ready to move', 'Green certified', 'Gated community', 'Smart home', 'Investment returns', 'School nearby', 'Metro connectivity'],
    },
    {
      key: 'geography',
      label: 'Primary geography',
      type: 'text',
      placeholder: 'e.g. Whitefield, Bangalore',
    },
  ],

  restaurant_cafe: [
    {
      key: 'cuisine_type',
      label: 'What cuisine do you serve?',
      type: 'multi_select',
      options: ['Indian', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental', 'Fast Food', 'Café & Beverages', 'Bakery', 'Desserts', 'Multi-cuisine'],
      required: true,
    },
    {
      key: 'restaurant_format',
      label: 'Format',
      type: 'select',
      options: ['Dine-in only', 'Dine-in + Delivery', 'Cloud kitchen', 'Takeaway + Delivery', 'Café / Casual'],
      required: true,
    },
    {
      key: 'delivery_platforms',
      label: 'Delivery platforms you are on',
      type: 'chips',
      options: ['Swiggy', 'Zomato', 'Own website', 'WhatsApp ordering', 'None'],
    },
    {
      key: 'speciality',
      label: 'What makes your food special?',
      type: 'chips',
      options: ['Family recipes', 'Organic ingredients', 'Live counters', 'Unlimited thali', 'Imported ingredients', 'Chef-curated menu', 'Regional authenticity'],
    },
    {
      key: 'avg_spend',
      label: 'Average spend per person',
      type: 'select',
      options: ['Under ₹200', '₹200–500', '₹500–1000', '₹1000+'],
    },
  ],

  fashion_clothing: [
    {
      key: 'clothing_category',
      label: 'What do you sell?',
      type: 'multi_select',
      options: ['Western wear', 'Ethnic wear', 'Kids wear', 'Sportswear', 'Accessories', 'Footwear', 'Luxury / Designer', 'Sustainable fashion'],
      required: true,
    },
    {
      key: 'gender_focus',
      label: 'Primary customer',
      type: 'select',
      options: ["Women's", "Men's", 'Unisex', "Kids'"],
    },
    {
      key: 'sales_channel',
      label: 'Where do you sell?',
      type: 'chips',
      options: ['Own website', 'Instagram DM', 'Amazon', 'Myntra', 'Ajio', 'Physical store'],
    },
    {
      key: 'size_range',
      label: 'Size range',
      type: 'chips',
      options: ['XS–XXL standard', 'Plus size inclusive', 'One size fits all', 'Custom sizing'],
    },
    {
      key: 'brand_origin',
      label: 'Brand origin / manufacturing',
      type: 'select',
      options: ['Made in India', 'Imported', 'Handloom / Handcrafted', 'Sustainable / recycled'],
    },
  ],

  salon_beauty: [
    {
      key: 'service_type',
      label: 'What services do you offer?',
      type: 'multi_select',
      options: ['Hair care', 'Skin care / Facials', 'Nail art', 'Waxing', 'Makeup', 'Bridal packages', 'Spa & massage', 'Permanent makeup / Microblading'],
      required: true,
    },
    {
      key: 'gender_served',
      label: 'Who do you serve?',
      type: 'select',
      options: ['Ladies only', 'Gents only', 'Unisex'],
    },
    {
      key: 'booking_method',
      label: 'How do clients book?',
      type: 'chips',
      options: ['WhatsApp / Phone call', 'Instagram DM', 'Website booking', 'Walk-in only', 'App (Fresha / StyleSeat)'],
    },
    {
      key: 'product_brands',
      label: 'Products you use (builds trust)',
      type: 'chips',
      options: ['Wella', 'Schwarzkopf', 'Loreal', 'Kerastase', 'Caudalie', 'Dermalogica', 'Own brand', 'Organic / Natural only'],
    },
    {
      key: 'speciality',
      label: 'What are you known for?',
      type: 'text',
      placeholder: 'e.g. Keratin treatments, Bridal makeup, Scalp therapy',
    },
  ],

  gym_fitness: [
    {
      key: 'facility_type',
      label: 'What kind of facility?',
      type: 'select',
      options: ['Full gym with equipment', 'CrossFit / Functional training', 'Yoga studio', 'Zumba / Dance fitness', 'Boxing / MMA', 'Personal training only', 'Sports academy'],
      required: true,
    },
    {
      key: 'membership_type',
      label: 'Membership structure',
      type: 'chips',
      options: ['Monthly', 'Quarterly', 'Annual', 'Per session / Drop-in', 'Corporate packages'],
    },
    {
      key: 'class_types',
      label: 'Classes offered',
      type: 'chips',
      options: ['Yoga', 'Zumba', 'HIIT', 'CrossFit', 'Spinning', 'Pilates', 'Bootcamp', 'Swimming'],
    },
    {
      key: 'speciality',
      label: 'What do members love about you?',
      type: 'chips',
      options: ['Expert trainers', 'Premium equipment', 'Women-only batches', 'Diet consultation', 'Injury rehab', 'Results tracking app'],
    },
  ],

  education_coaching: [
    {
      key: 'course_type',
      label: 'What do you teach?',
      type: 'multi_select',
      options: ['School academics (K-12)', 'IIT/JEE/NEET coaching', 'CA/UPSC/competitive exams', 'Language learning', 'Skill development', 'MBA/CAT coaching', 'Online courses / EdTech', 'Hobby classes'],
      required: true,
    },
    {
      key: 'delivery_format',
      label: 'How do you deliver?',
      type: 'select',
      options: ['In-person only', 'Online only', 'Hybrid', 'Recorded + Live combo'],
    },
    {
      key: 'batch_size',
      label: 'Typical batch size',
      type: 'select',
      options: ['1-on-1 only', 'Small groups (2-10)', 'Medium batches (10-30)', 'Large batches (30+)'],
    },
    {
      key: 'usp',
      label: 'Why do students choose you?',
      type: 'chips',
      options: ['Result track record', 'Expert faculty', 'Affordable fees', 'Study material quality', 'Doubt-clearing support', 'Mock tests & practice'],
    },
  ],

  ecommerce: [
    {
      key: 'product_category',
      label: 'What do you sell?',
      type: 'text',
      placeholder: 'e.g. Skincare, Home decor, Electronics accessories',
      required: true,
    },
    {
      key: 'sales_channels',
      label: 'Where do you sell?',
      type: 'chips',
      options: ['Own website (Shopify/WooCommerce)', 'Amazon', 'Flipkart', 'Meesho', 'Instagram Shop', 'WhatsApp catalog'],
    },
    {
      key: 'shipping_policy',
      label: 'Shipping offering',
      type: 'chips',
      options: ['Free shipping all orders', 'Free above ₹499', 'Same-day delivery (select cities)', 'Pan-India delivery', 'International shipping'],
    },
    {
      key: 'avg_order_value',
      label: 'Average order value',
      type: 'select',
      options: ['Under ₹299', '₹300–800', '₹800–2000', '₹2000+'],
    },
    {
      key: 'usp',
      label: 'What makes you stand out?',
      type: 'chips',
      options: ['Handmade / Artisanal', 'Organic / Natural', 'Personalised gifts', 'COD available', 'Easy returns', 'Exclusive designs'],
    },
  ],

  jewellery: [
    {
      key: 'jewellery_type',
      label: 'What jewellery do you make/sell?',
      type: 'multi_select',
      options: ['Gold jewellery (22K/18K)', 'Diamond jewellery', 'Silver jewellery (92.5)', 'Kundan / Polki', 'Temple jewellery', 'Imitation / Fashion jewellery', 'Lab-grown diamonds', 'Branded jewellery'],
      required: true,
    },
    {
      key: 'customer_occasion',
      label: 'Primary purchase occasion',
      type: 'chips',
      options: ['Wedding & bridal', 'Gifting', 'Daily wear', 'Festive season', 'Investment'],
    },
    {
      key: 'sales_channel',
      label: 'Where do customers buy?',
      type: 'chips',
      options: ['Physical showroom', 'Online store', 'Instagram orders', 'WhatsApp catalog', 'Exhibitions & pop-ups'],
    },
    {
      key: 'making_style',
      label: 'Craftsmanship origin',
      type: 'select',
      options: ['Handcrafted', 'Machine-made', 'Mix of both', 'Certified craftsmen (Rajasthan/Kolkata etc.)'],
    },
  ],

  interior_design: [
    {
      key: 'project_type',
      label: 'What projects do you take?',
      type: 'multi_select',
      options: ['Residential homes', 'Luxury villas', 'Commercial offices', 'Retail stores', 'Hospitality / Hotels', 'Modular kitchens', 'Turnkey projects'],
      required: true,
    },
    {
      key: 'style_specialty',
      label: 'Your design style',
      type: 'chips',
      options: ['Contemporary', 'Minimalist', 'Luxury / High-end', 'Traditional Indian', 'Industrial', 'Eclectic', 'Vastu-compliant', 'Sustainable design'],
    },
    {
      key: 'budget_range',
      label: 'Typical project budget',
      type: 'select',
      options: ['Under ₹3L (budget)', '₹3–8L (mid-range)', '₹8–20L (premium)', '₹20L+ (luxury)'],
    },
    {
      key: 'service_model',
      label: 'How do you work?',
      type: 'select',
      options: ['Consultation only', 'Full-service turnkey', 'Design only, client executes', 'Online design service'],
    },
    {
      key: 'portfolio_strength',
      label: 'How many projects completed?',
      type: 'select',
      options: ['1–10 (new studio)', '10–50', '50–200', '200+'],
    },
  ],

  consultant: [
    {
      key: 'consulting_type',
      label: 'What do you consult on?',
      type: 'multi_select',
      options: ['Business strategy', 'Financial advisory', 'HR & talent', 'Marketing & growth', 'Legal & compliance', 'Tax & CA services', 'IT & digital transformation', 'Life / Executive coaching'],
      required: true,
    },
    {
      key: 'client_type',
      label: 'Your typical client',
      type: 'select',
      options: ['Individual / Solopreneur', 'Startups (0–5 cr revenue)', 'SMBs (5–50 cr)', 'Enterprise (50 cr+)', 'C-suite executives'],
    },
    {
      key: 'engagement_model',
      label: 'How do clients work with you?',
      type: 'chips',
      options: ['One-time consultation', 'Monthly retainer', 'Project-based', 'Group programs / Cohorts', '1-on-1 coaching sessions'],
    },
    {
      key: 'credentials',
      label: 'Key credentials (helps content strategy)',
      type: 'chips',
      options: ['CA / CPA certified', 'MBA (IIM/ISB)', 'Ex-corporate (MNC)', '10+ years experience', 'Published author', 'TEDx speaker'],
    },
  ],

  other: [
    {
      key: 'business_type',
      label: 'Describe your business briefly',
      type: 'text',
      placeholder: 'e.g. We sell handmade candles and home fragrances online',
      required: true,
    },
    {
      key: 'customer_outcome',
      label: 'What transformation do customers get?',
      type: 'text',
      placeholder: 'e.g. A more relaxing home environment',
    },
    {
      key: 'usp',
      label: 'Why choose you over competitors?',
      type: 'chips',
      options: ['Quality', 'Price', 'Speed', 'Customer service', 'Unique product', 'Local expertise', 'Personalisation'],
    },
  ],
}

export const INDUSTRY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  restaurant_cafe: 'Restaurant / Café',
  fashion_clothing: 'Fashion & Clothing',
  salon_beauty: 'Salon & Beauty',
  interior_design: 'Interior Design',
  gym_fitness: 'Gym & Fitness',
  education_coaching: 'Education & Coaching',
  ecommerce: 'E-commerce',
  jewellery: 'Jewellery',
  consultant: 'Consulting / Advisory',
  other: 'Other',
}
