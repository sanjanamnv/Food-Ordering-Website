import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Clock,
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  X,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Tag,
  MapPin,
  Menu,
  Phone,
  Mail,
  Heart
} from 'lucide-react';

// Data Interfaces
interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  cuisine: string;
  vegetarian: boolean;
  tags: string[];
  available: boolean;
  preparationTimeMinutes: number;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cuisineTypes: string[];
  rating: number;
  deliveryEstimateMinutes: number;
  minimumOrderAmount: number;
  addressCity: string;
  active: boolean;
}

interface CartItem extends FoodItem {
  quantity: number;
}

interface OrderItemSnapshot {
  foodItemId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  vegetarian: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  restaurantName: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: 'ORDER_PLACED' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  cancellationReason?: string;
}

// Curated Restaurant Catalog
const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Paradise Biryani Darbar',
    description: 'Authentic royal Hyderabadi dum biryani slow-cooked with basmati rice, saffron, and aromatic whole spices.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['Biryani', 'North Indian', 'Mughlai'],
    rating: 4.8,
    deliveryEstimateMinutes: 30,
    minimumOrderAmount: 0,
    addressCity: 'Hyderabad',
    active: true
  },
  {
    id: 'rest-2',
    name: 'Punjabi Rasoi & Tandoor',
    description: 'Rich buttery curries, smokey tandoori breads, and slow-simmered dal makhani prepared in traditional dhabha style.',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['North Indian', 'Tandoori', 'Comfort Food'],
    rating: 4.6,
    deliveryEstimateMinutes: 25,
    minimumOrderAmount: 0,
    addressCity: 'New Delhi',
    active: true
  },
  {
    id: 'rest-3',
    name: 'Udupi Sri Krishna Bhavan',
    description: 'Crispy golden dosas, fluffy steamed idlis, piping hot filter coffee, and freshly ground coconut chutneys.',
    imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['South Indian', 'Vegetarian', 'Healthy Food'],
    rating: 4.9,
    deliveryEstimateMinutes: 20,
    minimumOrderAmount: 0,
    addressCity: 'Bengaluru',
    active: true
  },
  {
    id: 'rest-4',
    name: 'Napoli Woodfired Pizzeria',
    description: 'Hand-tossed sourdough pizzas topped with San Marzano tomatoes, buffalo mozzarella, and fresh basil leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['Pizza', 'Italian', 'Fast Food'],
    rating: 4.7,
    deliveryEstimateMinutes: 35,
    minimumOrderAmount: 0,
    addressCity: 'Mumbai',
    active: true
  },
  {
    id: 'rest-5',
    name: 'Dragon Wok Asian House',
    description: 'Sizzling Hakka noodles, Schezwan fried rice, steamed dim sums, and spicy chilli garlic appetizers.',
    imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['Chinese', 'Asian', 'Quick Bites'],
    rating: 4.5,
    deliveryEstimateMinutes: 25,
    minimumOrderAmount: 0,
    addressCity: 'Kolkata',
    active: true
  },
  {
    id: 'rest-6',
    name: 'The Gourmet Burger Station',
    description: 'Artisan brioche buns, smashed patties, melted cheddar, and crispy seasoned fries.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['Burgers', 'American', 'Fast Food'],
    rating: 4.6,
    deliveryEstimateMinutes: 25,
    minimumOrderAmount: 0,
    addressCity: 'Pune',
    active: true
  },
  {
    id: 'rest-7',
    name: 'Royal Shahi Mithai & Bakery',
    description: 'Warm gulab jamuns, saffron rasmalai, baked cheesecakes, and classic Indian sweet delicacies.',
    imageUrl: 'https://images.unsplash.com/photo-1527772485170-7bcb05845722?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['Desserts', 'Bakery', 'Beverages'],
    rating: 4.9,
    deliveryEstimateMinutes: 20,
    minimumOrderAmount: 0,
    addressCity: 'Jaipur',
    active: true
  },
  {
    id: 'rest-8',
    name: 'Vitality Greens & Cold Pressed',
    description: 'Organic quinoa harvest bowls, antioxidant cold-pressed juices, protein salads, and clean nutritional meals.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    cuisineTypes: ['Healthy Food', 'Salads', 'Beverages'],
    rating: 4.7,
    deliveryEstimateMinutes: 20,
    minimumOrderAmount: 0,
    addressCity: 'Bengaluru',
    active: true
  }
];

// Curated Food Items Catalog
const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food-1',
    restaurantId: 'rest-1',
    restaurantName: 'Paradise Biryani Darbar',
    name: 'Hyderabadi Chicken Dum Biryani',
    description: 'Tender chicken marinated overnight in roasted spices and slow cooked in sealed handis with aged basmati rice.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    price: 299,
    category: 'Biryani',
    cuisine: 'Indian',
    vegetarian: false,
    tags: ['spicy', 'comfort', 'bestseller'],
    available: true,
    preparationTimeMinutes: 25
  },
  {
    id: 'food-2',
    restaurantId: 'rest-1',
    restaurantName: 'Paradise Biryani Darbar',
    name: 'Shahi Paneer Dum Biryani',
    description: 'Fresh cottage cheese cubes cooked in pure desi ghee, mint, caramelized onions, and fragrant saffron rice.',
    imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80',
    price: 269,
    category: 'Biryani',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['comfort', 'vegetarian', 'bestseller'],
    available: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-3',
    restaurantId: 'rest-1',
    restaurantName: 'Paradise Biryani Darbar',
    name: 'Mirchi Ka Salan & Raita Combo',
    description: 'Traditional peanut-sesame curry served with green chillies and chilled spiced cumin cucumber raita.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    price: 99,
    category: 'North Indian',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['spicy', 'budget', 'vegetarian'],
    available: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-4',
    restaurantId: 'rest-2',
    restaurantName: 'Punjabi Rasoi & Tandoor',
    name: 'Paneer Butter Masala',
    description: 'Silky paneer cubes simmered in a mildly sweet and tangy rich makhani gravy with cream and kasuri methi.',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
    price: 249,
    category: 'North Indian',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['comfort', 'vegetarian', 'bestseller'],
    available: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-5',
    restaurantId: 'rest-2',
    restaurantName: 'Punjabi Rasoi & Tandoor',
    name: 'Dal Makhani',
    description: 'Whole black lentils and kidney beans slow-cooked overnight with white butter and fresh cream.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    price: 199,
    category: 'North Indian',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['comfort', 'vegetarian', 'budget'],
    available: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-6',
    restaurantId: 'rest-2',
    restaurantName: 'Punjabi Rasoi & Tandoor',
    name: 'Butter Garlic Naan (2 pcs)',
    description: 'Oven-baked fluffy leavened bread brushed with melted butter and toasted garlic flakes.',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',
    price: 79,
    category: 'North Indian',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['budget', 'vegetarian', 'quick'],
    available: true,
    preparationTimeMinutes: 10
  },
  {
    id: 'food-7',
    restaurantId: 'rest-3',
    restaurantName: 'Udupi Sri Krishna Bhavan',
    name: 'Mysore Masala Dosa',
    description: 'Golden crisp fermented crepe layered with spicy red garlic paste and filled with potato masala.',
    imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80',
    price: 129,
    category: 'South Indian',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['budget', 'vegetarian', 'quick', 'bestseller'],
    available: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-8',
    restaurantId: 'rest-3',
    restaurantName: 'Udupi Sri Krishna Bhavan',
    name: 'Steamed Idli & Vada Combo',
    description: 'Two fluffy steamed rice cakes and one crunchy medu vada served with piping hot sambar and chutneys.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    price: 99,
    category: 'South Indian',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['budget', 'healthy', 'vegetarian', 'quick'],
    available: true,
    preparationTimeMinutes: 10
  },
  {
    id: 'food-9',
    restaurantId: 'rest-4',
    restaurantName: 'Napoli Woodfired Pizzeria',
    name: 'Margherita Gourmet Pizza (11 inch)',
    description: 'Classic Neapolitan sourdough crust with San Marzano tomato sauce, fresh buffalo mozzarella, and basil.',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    price: 349,
    category: 'Pizza',
    cuisine: 'Italian',
    vegetarian: true,
    tags: ['comfort', 'vegetarian', 'bestseller'],
    available: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-10',
    restaurantId: 'rest-4',
    restaurantName: 'Napoli Woodfired Pizzeria',
    name: 'Spicy Peri-Peri Paneer Pizza',
    description: 'Spicy marinated cottage cheese, bell peppers, paprika flakes, and bubbly mozzarella on crispy crust.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    price: 389,
    category: 'Pizza',
    cuisine: 'Italian',
    vegetarian: true,
    tags: ['spicy', 'comfort', 'vegetarian'],
    available: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-11',
    restaurantId: 'rest-5',
    restaurantName: 'Dragon Wok Asian House',
    name: 'Chilli Garlic Hakka Noodles',
    description: 'Wok-tossed noodles with crunchy julienned bell peppers, spring onions, and spicy chilli garlic paste.',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    price: 189,
    category: 'Chinese',
    cuisine: 'Chinese',
    vegetarian: true,
    tags: ['spicy', 'quick', 'budget', 'vegetarian'],
    available: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-12',
    restaurantId: 'rest-5',
    restaurantName: 'Dragon Wok Asian House',
    name: 'Crispy Chilli Paneer Dry',
    description: 'Crispy tossed paneer cubes coated in dark soy sauce, crushed ginger, and fresh green chillies.',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
    price: 219,
    category: 'Chinese',
    cuisine: 'Chinese',
    vegetarian: true,
    tags: ['spicy', 'quick', 'vegetarian', 'bestseller'],
    available: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-13',
    restaurantId: 'rest-6',
    restaurantName: 'The Gourmet Burger Station',
    name: 'Crispy Veg Maharaja Burger',
    description: 'Double spiced vegetable patty with crisp lettuce, pickled gherkins, melted cheddar, and secret burger sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    price: 169,
    category: 'Burgers',
    cuisine: 'American',
    vegetarian: true,
    tags: ['comfort', 'budget', 'vegetarian', 'bestseller'],
    available: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-14',
    restaurantId: 'rest-6',
    restaurantName: 'The Gourmet Burger Station',
    name: 'Peri-Peri Crinkle Fries',
    description: 'Hot crinkle cut potato fries seasoned with tangy African bird eye pepper spice blend.',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80',
    price: 99,
    category: 'Burgers',
    cuisine: 'American',
    vegetarian: true,
    tags: ['spicy', 'quick', 'budget', 'vegetarian'],
    available: true,
    preparationTimeMinutes: 10
  },
  {
    id: 'food-15',
    restaurantId: 'rest-7',
    restaurantName: 'Royal Shahi Mithai & Bakery',
    name: 'Hot Saffron Gulab Jamun (2 pcs)',
    description: 'Soft melt-in-mouth khoya dumplings soaked in fragrant cardamom and saffron infused sugar syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=800&auto=format&fit=crop&q=80',
    price: 79,
    category: 'Desserts',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['sweet', 'comfort', 'budget', 'vegetarian', 'bestseller'],
    available: true,
    preparationTimeMinutes: 5
  },
  {
    id: 'food-16',
    restaurantId: 'rest-7',
    restaurantName: 'Royal Shahi Mithai & Bakery',
    name: 'Rasmalai in Pistachio Rabdi (2 pcs)',
    description: 'Delicate cottage cheese discs served in thickened saffron pistachio milk.',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80',
    price: 99,
    category: 'Desserts',
    cuisine: 'Indian',
    vegetarian: true,
    tags: ['sweet', 'comfort', 'vegetarian'],
    available: true,
    preparationTimeMinutes: 5
  },
  {
    id: 'food-17',
    restaurantId: 'rest-8',
    restaurantName: 'Vitality Greens & Cold Pressed',
    name: 'Mediterranean Quinoa & Avocado Bowl',
    description: 'Steamed organic quinoa, sliced Hass avocado, kalamata olives, cherry tomatoes, and tahini lemon dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    price: 269,
    category: 'Healthy Food',
    cuisine: 'Continental',
    vegetarian: true,
    tags: ['healthy', 'vegetarian', 'bestseller'],
    available: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-18',
    restaurantId: 'rest-8',
    restaurantName: 'Vitality Greens & Cold Pressed',
    name: 'Cold-Pressed ABC Immunity Booster Juice',
    description: 'Fresh raw Apple, Beetroot, and Carrot juice cold-pressed with fresh ginger and key lime.',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80',
    price: 119,
    category: 'Beverages',
    cuisine: 'Healthy',
    vegetarian: true,
    tags: ['healthy', 'quick', 'budget', 'vegetarian'],
    available: true,
    preparationTimeMinutes: 5
  }
];

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'home' | 'restaurants' | 'menu' | 'cart' | 'checkout' | 'orders' | 'smartbite' | 'admin'>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('rest-1');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState<string>('');

  // Application Data State
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-101',
      orderNumber: 'FN-20261012-7842',
      customerName: 'Sanjana Rao',
      customerEmail: 'sanjana@foodnest.com',
      customerPhone: '+91 9888877777',
      restaurantName: 'Paradise Biryani Darbar',
      items: [
        {
          foodItemId: 'food-1',
          name: 'Hyderabadi Chicken Dum Biryani',
          imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
          unitPrice: 299,
          quantity: 2,
          itemTotal: 598,
          vegetarian: false
        },
        {
          foodItemId: 'food-3',
          name: 'Mirchi Ka Salan & Raita Combo',
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
          unitPrice: 99,
          quantity: 1,
          itemTotal: 99,
          vegetarian: true
        }
      ],
      subtotal: 697,
      deliveryFee: 0,
      discount: 100,
      tax: 29.85,
      totalAmount: 626.85,
      couponCode: 'FLAT100',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      orderStatus: 'PREPARING',
      createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString()
    }
  ]);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: 'CUSTOMER' | 'ADMIN' } | null>({
    id: 'user-demo-1',
    name: 'Sanjana Rao',
    email: 'sanjana@foodnest.com',
    role: 'CUSTOMER'
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  // Cart & Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // SmartBite Recommendation State
  const [smartBiteMood, setSmartBiteMood] = useState('spicy');
  const [smartBiteBudget, setSmartBiteBudget] = useState<number | null>(300);
  const [smartBiteVegOnly, setSmartBiteVegOnly] = useState(false);
  const [smartBiteCuisine, setSmartBiteCuisine] = useState('all');
  const [smartBiteLoading, setSmartBiteLoading] = useState(false);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal >= 500 ? 0 : 40;
  }, [cartSubtotal, cart.length]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal === 0) return 0;
    return appliedCoupon.discount;
  }, [appliedCoupon, cartSubtotal]);

  const taxAmount = useMemo(() => {
    const taxable = Math.max(0, cartSubtotal - discountAmount);
    return Math.round(taxable * 0.05 * 100) / 100;
  }, [cartSubtotal, discountAmount]);

  const grandTotal = useMemo(() => {
    if (cart.length === 0) return 0;
    return Math.round((cartSubtotal - discountAmount + deliveryFee + taxAmount) * 100) / 100;
  }, [cartSubtotal, discountAmount, deliveryFee, taxAmount, cart.length]);

  // Cart Management
  const addToCart = (food: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === food.id);
      if (existing) {
        return prev.map(i => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...food, quantity: 1 }];
    });
    showToast(`Added "${food.name}" to cart`);
  };

  const updateCartQuantity = (foodId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === foodId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon Application
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    setCouponError('');
    if (!code) return;

    if (code === 'WELCOME50') {
      if (cartSubtotal < 199) {
        setCouponError('Minimum order of ₹199 required for WELCOME50');
        return;
      }
      const disc = Math.min(150, cartSubtotal * 0.5);
      setAppliedCoupon({ code, discount: disc });
      showToast(`Coupon WELCOME50 applied! Saved ₹${disc}`);
    } else if (code === 'TASTY20') {
      if (cartSubtotal < 149) {
        setCouponError('Minimum order of ₹149 required for TASTY20');
        return;
      }
      const disc = Math.min(100, cartSubtotal * 0.2);
      setAppliedCoupon({ code, discount: disc });
      showToast(`Coupon TASTY20 applied! Saved ₹${disc}`);
    } else if (code === 'FLAT100') {
      if (cartSubtotal < 399) {
        setCouponError('Minimum order of ₹399 required for FLAT100');
        return;
      }
      setAppliedCoupon({ code, discount: 100 });
      showToast('Coupon FLAT100 applied! Saved ₹100');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME50 or FLAT100');
    }
  };

  // Place Order
  const handlePlaceOrder = (paymentMethod: string) => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `FN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: currentUser?.name || 'Customer',
      customerEmail: currentUser?.email || 'customer@foodnest.com',
      customerPhone: '+91 9888877777',
      restaurantName: cart[0]?.restaurantName || 'FoodNest Kitchen',
      items: cart.map(item => ({
        foodItemId: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        unitPrice: item.price,
        quantity: item.quantity,
        itemTotal: item.price * item.quantity,
        vegetarian: item.vegetarian
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      discount: discountAmount,
      tax: taxAmount,
      totalAmount: grandTotal,
      couponCode: appliedCoupon?.code,
      paymentMethod,
      paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
      orderStatus: 'ORDER_PLACED',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast(`Order #${newOrder.orderNumber} placed successfully!`);
    setCurrentPage('orders');
  };

  // SmartBite Recommendation Logic
  const recommendations = useMemo(() => {
    return foodItems.filter(item => {
      if (!item.available) return false;
      if (smartBiteVegOnly && !item.vegetarian) return false;
      if (smartBiteBudget && item.price > smartBiteBudget) return false;
      if (smartBiteCuisine !== 'all' && !item.cuisine.toLowerCase().includes(smartBiteCuisine.toLowerCase()) && !item.category.toLowerCase().includes(smartBiteCuisine.toLowerCase())) {
        return false;
      }

      if (smartBiteMood === 'spicy' && item.tags.includes('spicy')) return true;
      if (smartBiteMood === 'comfort' && item.tags.includes('comfort')) return true;
      if (smartBiteMood === 'healthy' && (item.tags.includes('healthy') || item.category === 'Healthy Food')) return true;
      if (smartBiteMood === 'budget' && (item.tags.includes('budget') || item.price <= 150)) return true;
      if (smartBiteMood === 'quick' && (item.tags.includes('quick') || item.preparationTimeMinutes <= 15)) return true;
      if (smartBiteMood === 'sweet' && (item.tags.includes('sweet') || item.category === 'Desserts')) return true;
      if (smartBiteMood === 'vegetarian' && item.vegetarian) return true;

      return false;
    });
  }, [foodItems, smartBiteMood, smartBiteBudget, smartBiteVegOnly, smartBiteCuisine]);

  const handleSmartBiteSearch = () => {
    setSmartBiteLoading(true);
    setTimeout(() => {
      setSmartBiteLoading(false);
      showToast(`Found ${recommendations.length} personalized dishes for you!`);
    }, 350);
  };

  // Admin Invalidation / Actions
  const toggleItemAvailability = (id: string) => {
    setFoodItems(prev => prev.map(item => item.id === id ? { ...item, available: !item.available } : item));
    showToast('Updated item stock availability');
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setFoodItems(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));
    showToast(`Updated price to ₹${newPrice}`);
  };

  const currentRestaurant = useMemo(() => {
    return restaurants.find(r => r.id === selectedRestaurantId) || restaurants[0];
  }, [restaurants, selectedRestaurantId]);

  // Filtered Restaurants for Listing Page
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      if (selectedCity !== 'All Cities' && r.addressCity.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (categoryFilter !== 'all' && !r.cuisineTypes.some(c => c.toLowerCase().includes(categoryFilter.toLowerCase()))) {
        return false;
      }
      if (restaurantSearchQuery.trim()) {
        const q = restaurantSearchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.cuisineTypes.some(c => c.toLowerCase().includes(q)) || r.addressCity.toLowerCase().includes(q);
      }
      return true;
    });
  }, [restaurants, selectedCity, categoryFilter, restaurantSearchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Clean Customer Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Brand Wordmark */}
          <div
            onClick={() => {
              setCategoryFilter('all');
              setCurrentPage('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-base shadow-xs group-hover:bg-orange-700 transition-colors">
              FN
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">FoodNest</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => {
                setCategoryFilter('all');
                setCurrentPage('home');
              }}
              className={`hover:text-orange-600 transition-colors cursor-pointer ${currentPage === 'home' ? 'text-orange-600 font-bold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setCurrentPage('restaurants');
              }}
              className={`hover:text-orange-600 transition-colors cursor-pointer ${currentPage === 'restaurants' ? 'text-orange-600 font-bold' : ''}`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setCurrentPage('smartbite')}
              className={`hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1.5 ${currentPage === 'smartbite' ? 'text-orange-600 font-bold' : ''}`}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              SmartBite
            </button>
            <button
              onClick={() => {
                if (!currentUser) {
                  setAuthMode('login');
                  setShowAuthModal(true);
                  showToast('Please sign in to view your orders');
                  return;
                }
                setCurrentPage('orders');
              }}
              className={`hover:text-orange-600 transition-colors cursor-pointer ${currentPage === 'orders' ? 'text-orange-600 font-bold' : ''}`}
            >
              My Orders
            </button>
            {/* Admin Dashboard visible ONLY when authenticated administrator is logged in */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1.5 ${currentPage === 'admin' ? 'text-orange-600 font-bold' : ''}`}
              >
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                Admin Dashboard
              </button>
            )}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            {/* Cart Trigger */}
            <button
              onClick={() => setCurrentPage('cart')}
              className="relative p-2.5 rounded-xl border border-slate-200 hover:border-orange-500 bg-white text-slate-700 transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white tabular-nums">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* User Account Controls */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentUser.name}</span>
                  {currentUser.role === 'ADMIN' && (
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">ADMIN</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    showToast('Logged out successfully');
                    if (currentPage === 'admin') setCurrentPage('home');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold text-slate-600 hover:text-rose-600 cursor-pointer transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3">
            <button
              onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
              className={`block w-full text-left font-semibold text-sm py-1.5 ${currentPage === 'home' ? 'text-orange-600 font-bold' : 'text-slate-700'}`}
            >
              Home
            </button>
            <button
              onClick={() => { setCurrentPage('restaurants'); setMobileMenuOpen(false); }}
              className={`block w-full text-left font-semibold text-sm py-1.5 ${currentPage === 'restaurants' ? 'text-orange-600 font-bold' : 'text-slate-700'}`}
            >
              Restaurants
            </button>
            <button
              onClick={() => { setCurrentPage('smartbite'); setMobileMenuOpen(false); }}
              className={`block w-full text-left font-semibold text-sm py-1.5 ${currentPage === 'smartbite' ? 'text-orange-600 font-bold' : 'text-slate-700'}`}
            >
              SmartBite
            </button>
            <button
              onClick={() => {
                if (!currentUser) {
                  setAuthMode('login');
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                  showToast('Please sign in to view your orders');
                  return;
                }
                setCurrentPage('orders');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left font-semibold text-sm py-1.5 ${currentPage === 'orders' ? 'text-orange-600 font-bold' : 'text-slate-700'}`}
            >
              My Orders
            </button>
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className={`block w-full text-left font-semibold text-sm py-1.5 ${currentPage === 'admin' ? 'text-orange-600 font-bold' : 'text-slate-900 font-bold'}`}
              >
                Admin Dashboard
              </button>
            )}
            {currentUser ? (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setMobileMenuOpen(false);
                      showToast('Logged out successfully');
                      if (currentPage === 'admin') setCurrentPage('home');
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-center text-xs font-semibold text-slate-700"
                >
                  Login
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 rounded-xl bg-orange-600 text-center text-xs font-bold text-white shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Account / Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {currentUser ? 'Account Profile' : authMode === 'login' ? 'Sign In to FoodNest' : 'Create Account'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentUser ? (
              <div>
                <div className="mb-4">
                  <div className="text-xs text-slate-500">Current User</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.email}</div>
                  <div className="mt-2">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${currentUser.role === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-orange-100 text-orange-800'}`}>
                      Role: {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 mb-4">
                  <div className="text-xs font-bold text-slate-600 mb-2">Switch Active Account:</div>
                  <button
                    onClick={() => {
                      setCurrentUser({
                        id: 'user-demo-1',
                        name: 'Sanjana Rao',
                        email: 'sanjana@foodnest.com',
                        role: 'CUSTOMER'
                      });
                      setShowAuthModal(false);
                      showToast('Switched to Customer account');
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${currentUser.role === 'CUSTOMER' ? 'border-orange-500 bg-orange-50/50 text-orange-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="font-bold">Customer Account</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">sanjana@foodnest.com · Orders & Favorites</div>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser({
                        id: 'admin-1',
                        name: 'FoodNest Administrator',
                        email: 'admin@foodnest.com',
                        role: 'ADMIN'
                      });
                      setShowAuthModal(false);
                      showToast('Switched to Administrator account');
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${currentUser.role === 'ADMIN' ? 'border-orange-500 bg-orange-50/50 text-orange-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="font-bold">Administrator Account</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">admin@foodnest.com · Merchant & Catalog Console</div>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setShowAuthModal(false);
                    showToast('Logged out successfully');
                    if (currentPage === 'admin') setCurrentPage('home');
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out / Log Out
                </button>
              </div>
            ) : (
              <div>
                <div className="flex border-b border-slate-100 mb-4">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 text-xs font-bold border-b-2 cursor-pointer ${authMode === 'login' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-2 text-xs font-bold border-b-2 cursor-pointer ${authMode === 'signup' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'}`}
                  >
                    Create Account
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const email = authEmail.trim() || 'sanjana@foodnest.com';
                      const isAdmin = email.toLowerCase().includes('admin');
                      setCurrentUser({
                        id: `usr-${Date.now()}`,
                        name: isAdmin ? 'Administrator' : email.split('@')[0],
                        email,
                        role: isAdmin ? 'ADMIN' : 'CUSTOMER'
                      });
                      setShowAuthModal(false);
                      showToast(`Welcome back, ${email.split('@')[0]}!`);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="sanjana@foodnest.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-400 text-center mb-2">Or quick sign in as:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUser({
                              id: 'user-demo-1',
                              name: 'Sanjana Rao',
                              email: 'sanjana@foodnest.com',
                              role: 'CUSTOMER'
                            });
                            setShowAuthModal(false);
                            showToast('Signed in as Sanjana Rao');
                          }}
                          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer text-center"
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUser({
                              id: 'admin-1',
                              name: 'FoodNest Administrator',
                              email: 'admin@foodnest.com',
                              role: 'ADMIN'
                            });
                            setShowAuthModal(false);
                            showToast('Signed in as Administrator');
                          }}
                          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[11px] font-bold text-slate-900 cursor-pointer text-center"
                        >
                          Administrator
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = authName.trim() || 'New User';
                      const email = authEmail.trim() || 'user@foodnest.com';
                      setCurrentUser({
                        id: `usr-${Date.now()}`,
                        name,
                        email,
                        role: 'CUSTOMER'
                      });
                      setShowAuthModal(false);
                      showToast(`Account created! Welcome to FoodNest, ${name}.`);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98888 77777"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Create Account & Sign In
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Routed Views */}
      <main className="flex-1">
        {/* ========================================================
            PAGE 1: HOMEPAGE (CUSTOMER-CENTRIC)
           ======================================================== */}
        {currentPage === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-orange-50/60 via-white to-white py-14 border-b border-slate-200/80">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs mb-4">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="text-slate-500">Delivering in:</span>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="All Cities">All Indian Cities</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="New Delhi">New Delhi</option>
                      <option value="Pune">Pune</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Jaipur">Jaipur</option>
                    </select>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                    Good Food.<br />Great Mood.
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
                    Order from top neighbourhood restaurants, enjoy authentic dum biryanis, crispy dosas, hand-tossed pizzas, and healthy salads delivered fresh and piping hot.
                  </p>

                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex-1 flex items-center gap-3 px-3">
                      <Search className="w-5 h-5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search for biryani, pizza, dosa, burger..."
                        value={restaurantSearchQuery}
                        onChange={(e) => setRestaurantSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrentPage('restaurants');
                          }
                        }}
                        className="w-full text-sm bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
                      />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setCurrentPage('restaurants')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Find Food
                      </button>
                      <button
                        onClick={() => { setCategoryFilter('all'); setCurrentPage('restaurants'); }}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Explore Restaurants
                      </button>
                    </div>
                  </div>

                  {/* Trust markers */}
                  <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-600" /> 25–35 Min Express Delivery</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-emerald-600" /> 4.8+ Top Customer Ratings</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-600" /> Safe, Hygienic Packaging</span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
                      alt="Gourmet Dining Spread"
                      className="rounded-3xl shadow-lg w-full h-[380px] object-cover border border-slate-200"
                    />
                    <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                        ★ 4.9
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Verified Quality</div>
                        <div className="text-xs text-slate-500">Over 10,000+ happy foodies</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Food Categories Strip */}
            <section className="max-w-7xl mx-auto px-6 py-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Inspiration for your first order</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Explore popular categories curated for every craving</p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
                {[
                  { name: 'Biryani', icon: '🍚', cuisine: 'Biryani' },
                  { name: 'Pizza', icon: '🍕', cuisine: 'Pizza' },
                  { name: 'Burgers', icon: '🍔', cuisine: 'Burgers' },
                  { name: 'South Indian', icon: '🥞', cuisine: 'South Indian' },
                  { name: 'North Indian', icon: '🥘', cuisine: 'North Indian' },
                  { name: 'Chinese', icon: '🍜', cuisine: 'Chinese' },
                  { name: 'Desserts', icon: '🍰', cuisine: 'Desserts' },
                  { name: 'Beverages', icon: '☕', cuisine: 'Beverages' },
                  { name: 'Healthy Food', icon: '🥗', cuisine: 'Healthy Food' }
                ].map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setCategoryFilter(cat.cuisine);
                      setCurrentPage('restaurants');
                    }}
                    className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Special Deals & Offers Strip */}
            <section className="max-w-7xl mx-auto px-6 py-2 mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Deals & Special Offers</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Save on your next meal with verified promo codes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/80 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded">NEW USER</span>
                    <div className="font-extrabold text-base text-slate-900 mt-1.5">50% OFF (Up to ₹50)</div>
                    <div className="text-xs text-slate-600 mt-0.5">On minimum food order of ₹199</div>
                    <div className="text-xs font-mono font-bold text-orange-700 mt-2 bg-white/90 inline-block px-2.5 py-1 rounded-md border border-orange-200">
                      WELCOME50
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('WELCOME50');
                      setCouponInput('WELCOME50');
                      showToast('Coupon WELCOME50 copied!');
                    }}
                    className="text-xs font-bold bg-white hover:bg-orange-600 hover:text-white text-orange-700 border border-orange-300 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    Copy Code
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">FEAST ORDERS</span>
                    <div className="font-extrabold text-base text-slate-900 mt-1.5">Flat ₹100 Discount</div>
                    <div className="text-xs text-slate-600 mt-0.5">On orders above ₹399</div>
                    <div className="text-xs font-mono font-bold text-emerald-800 mt-2 bg-white/90 inline-block px-2.5 py-1 rounded-md border border-emerald-200">
                      FLAT100
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('FLAT100');
                      setCouponInput('FLAT100');
                      showToast('Coupon FLAT100 copied!');
                    }}
                    className="text-xs font-bold bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    Copy Code
                  </button>
                </div>

                <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/80 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-600 text-white px-2 py-0.5 rounded">EXPRESS</span>
                    <div className="font-extrabold text-base text-slate-900 mt-1.5">Free Express Delivery</div>
                    <div className="text-xs text-slate-600 mt-0.5">Automatically applied over ₹500</div>
                    <div className="text-xs font-mono font-bold text-sky-800 mt-2 bg-white/90 inline-block px-2.5 py-1 rounded-md border border-sky-200">
                      NO CODE NEEDED
                    </div>
                  </div>
                  <button
                    onClick={() => { setCurrentPage('restaurants'); }}
                    className="text-xs font-bold bg-white hover:bg-sky-600 hover:text-white text-sky-800 border border-sky-300 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </section>

            {/* SmartBite Promotional Section */}
            <section className="max-w-7xl mx-auto px-6 py-4 mb-8">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 sm:p-10 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold uppercase px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized Recommendation Feature</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                    Not sure what to eat? Let SmartBite decide.
                  </h2>
                  <p className="text-orange-50 text-sm sm:text-base leading-relaxed mb-6">
                    Tell SmartBite what you're craving—spicy, comforting, budget-friendly, or healthy—and get curated dishes picked specifically for your preferences.
                  </p>
                  <button
                    onClick={() => setCurrentPage('smartbite')}
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    Find Food with SmartBite <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-6 text-center shrink-0 min-w-[200px]">
                  <div className="text-3xl font-extrabold text-white">7+ Craving Moods</div>
                  <div className="text-xs text-orange-100 font-medium mt-1">Smart taste matching</div>
                  <div className="text-[11px] text-white/80 mt-3 bg-white/10 py-1 px-2.5 rounded-lg">Instant discovery</div>
                </div>
              </div>
            </section>

            {/* Popular Restaurants Grid */}
            <section className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Top Rated Restaurants</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Beloved kitchens delivering high customer satisfaction</p>
                </div>
                <button
                  onClick={() => setCurrentPage('restaurants')}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1"
                >
                  View All Restaurants <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {restaurants.slice(0, 4).map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRestaurantId(r.id);
                      setCurrentPage('menu');
                    }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-44 overflow-hidden relative bg-slate-100">
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-xs flex items-center gap-1">
                        ★ {r.rating}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 mb-1">{r.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{r.description}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>⏱ {r.deliveryEstimateMinutes} mins</span>
                        <span>·</span>
                        <span>{r.addressCity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Popular Dishes with Direct Add-to-Cart */}
            <section className="max-w-7xl mx-auto px-6 py-8 pb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Bestselling Dishes Near You</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Customer favorites prepared freshly on order</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {foodItems.slice(0, 4).map(food => (
                  <div key={food.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="h-40 relative bg-slate-100">
                        <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 left-2.5 bg-white/95 p-1 rounded-md shadow-xs">
                          <div className={`w-3.5 h-3.5 border ${food.vegetarian ? 'border-emerald-600' : 'border-rose-600'} flex items-center justify-center p-0.5 rounded-xs`}>
                            <div className={`w-2 h-2 rounded-full ${food.vegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-[11px] font-semibold text-slate-400 mb-0.5">{food.restaurantName}</div>
                        <h3 className="font-bold text-sm text-slate-900 mb-1">{food.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{food.description}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between">
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">₹{food.price}</span>
                      <button
                        onClick={() => addToCart(food)}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================
            PAGE 2: RESTAURANTS LISTING PAGE
           ======================================================== */}
        {currentPage === 'restaurants' && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Restaurants Near You</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Discover partner dining spots delivering across top cities
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, cuisine, or city..."
                    value={restaurantSearchQuery}
                    onChange={(e) => setRestaurantSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none w-56"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none font-medium"
                >
                  <option value="all">All Cuisines</option>
                  <option value="Biryani">Biryani</option>
                  <option value="North Indian">North Indian</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Burgers">Burgers</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Healthy Food">Healthy Food</option>
                </select>

                {(categoryFilter !== 'all' || restaurantSearchQuery) && (
                  <button
                    onClick={() => { setCategoryFilter('all'); setRestaurantSearchQuery(''); }}
                    className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                <p className="text-sm text-slate-500 mb-4">No restaurants found matching your search.</p>
                <button
                  onClick={() => { setCategoryFilter('all'); setRestaurantSearchQuery(''); }}
                  className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRestaurantId(r.id);
                      setCurrentPage('menu');
                    }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-xs">
                        ★ {r.rating}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 mb-1">{r.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{r.description}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>⏱ {r.deliveryEstimateMinutes} mins</span>
                        <span>·</span>
                        <span>{r.cuisineTypes.join(', ')}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700">{r.addressCity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            PAGE 3: RESTAURANT MENU PAGE
           ======================================================== */}
        {currentPage === 'menu' && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Header banner */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs mb-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                <img src={currentRestaurant.imageUrl} alt={currentRestaurant.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">Partner Restaurant</div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{currentRestaurant.name}</h1>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{currentRestaurant.description}</p>
                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
                  <span className="font-bold text-emerald-700">★ {currentRestaurant.rating} (500+ reviews)</span>
                  <span>·</span>
                  <span>⏱ {currentRestaurant.deliveryEstimateMinutes} mins delivery</span>
                  <span>·</span>
                  <span>{currentRestaurant.cuisineTypes.join(', ')}</span>
                  <span>·</span>
                  <span>{currentRestaurant.addressCity}</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Available Menu Dishes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select and add items directly to your basket</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems
                .filter(item => item.restaurantId === currentRestaurant.id)
                .map(food => (
                  <div key={food.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                    <div className="h-44 relative bg-slate-100">
                      <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-md shadow-xs">
                        <div className={`w-3.5 h-3.5 border ${food.vegetarian ? 'border-emerald-600' : 'border-rose-600'} flex items-center justify-center p-0.5 rounded-xs`}>
                          <div className={`w-2 h-2 rounded-full ${food.vegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 mb-1">{food.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{food.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-slate-900 tabular-nums">₹{food.price}</span>
                        {food.available ? (
                          <button
                            onClick={() => addToCart(food)}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-rose-600">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            PAGE 4: SHOPPING CART
           ======================================================== */}
        {currentPage === 'cart' && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Your Food Basket</h1>

            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your basket is currently empty</h3>
                <p className="text-sm text-slate-500 mb-6">Explore our restaurant menus or find dishes with SmartBite.</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setCurrentPage('restaurants')}
                    className="bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer hover:bg-orange-700 transition-colors"
                  >
                    Browse Restaurants
                  </button>
                  <button
                    onClick={() => setCurrentPage('smartbite')}
                    className="bg-slate-100 text-slate-800 font-bold text-sm px-6 py-3 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    Try SmartBite
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Cart Items list */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <h2 className="text-base font-bold text-slate-900">Selected Items ({cart.length})</h2>
                    <button
                      onClick={clearCart}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Clear Basket
                    </button>
                  </div>

                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-none">
                        <div className="flex items-center gap-3">
                          <div className={`w-3.5 h-3.5 border ${item.vegetarian ? 'border-emerald-600' : 'border-rose-600'} flex items-center justify-center p-0.5 rounded-xs shrink-0`}>
                            <div className={`w-2 h-2 rounded-full ${item.vegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-500">₹{item.price} each</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Quantity stepper */}
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-white transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold tabular-nums text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="font-bold text-sm text-slate-900 tabular-nums w-18 text-right">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs sticky top-24">
                  <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">Bill Summary</h2>

                  {/* Coupon section */}
                  <div className="mb-5">
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Have a Promo Coupon?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="WELCOME50 or FLAT100"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-[11px] text-emerald-600 mt-1 font-bold">
                        ✓ {appliedCoupon.code} applied (Saved ₹{appliedCoupon.discount})
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4 mb-4">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-semibold tabular-nums text-slate-800">₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-semibold tabular-nums text-slate-800">
                        {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE (Above ₹500)</span> : `₹${deliveryFee}`}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Coupon Savings ({appliedCoupon?.code})</span>
                        <span className="tabular-nums">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span className="font-semibold tabular-nums text-slate-800">₹{taxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-sm text-slate-900">To Pay</span>
                    <span className="text-xl font-extrabold text-orange-600 tabular-nums">₹{grandTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage('checkout')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            PAGE 5: CHECKOUT PAGE
           ======================================================== */}
        {currentPage === 'checkout' && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Checkout & Delivery</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Delivery details */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">1. Delivery Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 mb-1 block">Full Name</label>
                      <input
                        type="text"
                        defaultValue={currentUser?.name || ''}
                        placeholder="Your Full Name"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 mb-1 block">Phone Number</label>
                      <input
                        type="text"
                        defaultValue="+91 9888877777"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-600 mb-1 block">Street Address</label>
                      <input
                        type="text"
                        defaultValue="42 Lakeview Enclave, Cyber Towers"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 mb-1 block">City</label>
                      <input
                        type="text"
                        defaultValue="Bengaluru"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 mb-1 block">PIN Code</label>
                      <input
                        type="text"
                        defaultValue="560081"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">2. Select Payment Option</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3.5 border border-orange-200 bg-orange-50/40 rounded-2xl cursor-pointer">
                      <input type="radio" name="payment" defaultChecked className="accent-orange-600 w-4 h-4" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</div>
                        <div className="text-[11px] text-slate-500">Pay cash or UPI to delivery agent at door</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50">
                      <input type="radio" name="payment" className="accent-orange-600 w-4 h-4" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Online UPI / Card (Simulated Sandbox)</div>
                        <div className="text-[11px] text-slate-500">Fast checkout (simulated demonstration)</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order summary card */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs sticky top-24">
                <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">Order Review</h2>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto text-xs text-slate-600">
                  {cart.map(i => (
                    <div key={i.id} className="flex justify-between">
                      <span>{i.quantity} × {i.name}</span>
                      <span className="font-bold tabular-nums">₹{(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold tabular-nums">₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold tabular-nums">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span className="tabular-nums">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-semibold tabular-nums">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span className="text-orange-600 tabular-nums">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlaceOrder('CASH_ON_DELIVERY')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            PAGE 6: MY ORDERS (5-STAGE TRACKER)
           ======================================================== */}
        {currentPage === 'orders' && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Track live preparation and delivery status
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('restaurants')}
                className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 px-3.5 py-2 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors"
              >
                + Place New Order
              </button>
            </div>

            {!currentUser ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to view your orders</h2>
                <p className="text-sm text-slate-500 mb-6">Track live meal preparations, past delivery history, and reorder favourite dishes.</p>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Sign In to Account
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                <p className="text-sm text-slate-500 mb-4">You have not placed any orders yet.</p>
                <button
                  onClick={() => setCurrentPage('restaurants')}
                  className="bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => {
                  const stages = ['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                  const currentStageIdx = stages.indexOf(order.orderStatus);
                  const isCancelled = order.orderStatus === 'CANCELLED';

                  return (
                    <div key={order.id} className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-base text-slate-900">{order.orderNumber}</span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isCancelled ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                              {order.orderStatus.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {order.restaurantName} · Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-slate-900 tabular-nums">₹{order.totalAmount.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Online Payment'}</div>
                        </div>
                      </div>

                      {/* Timeline */}
                      {!isCancelled && (
                        <div className="py-6">
                          <div className="flex justify-between items-center relative">
                            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                            {stages.map((stage, idx) => {
                              const isCompleted = idx < currentStageIdx;
                              const isCurrent = idx === currentStageIdx;
                              return (
                                <div key={stage} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isCompleted ? 'bg-emerald-600 text-white border-emerald-600' : isCurrent ? 'bg-orange-600 text-white border-orange-600 ring-4 ring-orange-100' : 'bg-white text-slate-400 border-slate-300'}`}>
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-[11px] mt-2 font-bold whitespace-nowrap ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {stage.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Items snapshot */}
                      <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-700 space-y-1.5 my-3">
                        {order.items.map(it => (
                          <div key={it.foodItemId} className="flex justify-between">
                            <span>{it.quantity} × {it.name}</span>
                            <span className="font-bold tabular-nums">₹{it.itemTotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom controls */}
                      <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                        <span>Delivery to: 42 Lakeview Enclave, Bengaluru</span>
                        <div className="flex gap-4">
                          {order.orderStatus === 'ORDER_PLACED' && (
                            <button
                              onClick={() => {
                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, orderStatus: 'CANCELLED', cancellationReason: 'Cancelled by customer' } : o));
                                showToast('Order cancelled');
                              }}
                              className="text-rose-600 font-bold hover:underline cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                          <button
                            onClick={() => {
                              order.items.forEach(it => {
                                const found = foodItems.find(f => f.id === it.foodItemId);
                                if (found) addToCart(found);
                              });
                              setCurrentPage('cart');
                            }}
                            className="text-orange-600 font-bold hover:underline cursor-pointer"
                          >
                            Reorder Dishes →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            PAGE 7: SMARTBITE RECOMMENDATION ENGINE (CLEAN & USER-FRIENDLY)
           ======================================================== */}
        {currentPage === 'smartbite' && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-md mb-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Personalized Dining Assistant</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                SmartBite — Find Your Perfect Meal
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Tell us your craving, budget, or dietary preferences, and discover handpicked dishes tailored specifically for you.
              </p>
            </div>

            {/* Preference Selector */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs mb-8">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
                1. Select Your Current Food Craving
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                {[
                  { id: 'spicy', label: 'Spicy Cravings', icon: '🌶️' },
                  { id: 'comfort', label: 'Comfort Food', icon: '🍲' },
                  { id: 'healthy', label: 'Healthy Choice', icon: '🥗' },
                  { id: 'budget', label: 'Budget Meals', icon: '💰' },
                  { id: 'quick', label: 'Quick Bites', icon: '⚡' },
                  { id: 'sweet', label: 'Sweet Tooth', icon: '🍨' },
                  { id: 'vegetarian', label: 'Veg Favorites', icon: '🌱' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSmartBiteMood(m.id)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${smartBiteMood === m.id ? 'border-orange-600 bg-orange-50/70 text-orange-900 font-bold ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'}`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Max Budget</label>
                  <select
                    value={smartBiteBudget || ''}
                    onChange={(e) => setSmartBiteBudget(e.target.value ? Number(e.target.value) : null)}
                    className="p-2 border border-slate-200 rounded-xl bg-white outline-none font-medium text-slate-800"
                  >
                    <option value="">Any Budget</option>
                    <option value="150">Under ₹150</option>
                    <option value="250">Under ₹250</option>
                    <option value="350">Under ₹350</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Cuisine Preference</label>
                  <select
                    value={smartBiteCuisine}
                    onChange={(e) => setSmartBiteCuisine(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl bg-white outline-none font-medium text-slate-800"
                  >
                    <option value="all">All Cuisines</option>
                    <option value="Indian">Indian</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Italian">Pizza / Italian</option>
                    <option value="Chinese">Chinese / Asian</option>
                    <option value="American">Burgers / American</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="veg-check"
                    checked={smartBiteVegOnly}
                    onChange={(e) => setSmartBiteVegOnly(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="veg-check" className="font-bold text-slate-700 cursor-pointer">
                    Strictly 100% Vegetarian
                  </label>
                </div>

                <div className="ml-auto pt-3">
                  <button
                    onClick={handleSmartBiteSearch}
                    disabled={smartBiteLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-2"
                  >
                    {smartBiteLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Get Recommendations</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Recommended Matches ({recommendations.length})</h3>
                <span className="text-xs text-slate-500">Ranked by craving match</span>
              </div>

              {recommendations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                  <p className="text-sm text-slate-500 mb-4">No dishes found matching this exact filter combination.</p>
                  <button
                    onClick={() => { setSmartBiteBudget(null); setSmartBiteVegOnly(false); setSmartBiteCuisine('all'); }}
                    className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Reset SmartBite Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="h-44 relative bg-slate-100">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-md shadow-xs">
                            <div className={`w-3.5 h-3.5 border ${item.vegetarian ? 'border-emerald-600' : 'border-rose-600'} flex items-center justify-center p-0.5 rounded-xs`}>
                              <div className={`w-2 h-2 rounded-full ${item.vegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            </div>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="text-xs font-semibold text-slate-400 mb-1">{item.restaurantName}</div>
                          <h4 className="font-bold text-base text-slate-900 mb-2">{item.name}</h4>

                          {/* Customer-Oriented Recommendation Reason */}
                          <div className="bg-amber-50 text-amber-900 border border-amber-200/60 p-2.5 rounded-xl text-xs mb-3 font-medium">
                            💡 Matches your {smartBiteMood} preference · {item.vegetarian ? 'Pure veg' : 'Non-veg'} · Ready in {item.preparationTimeMinutes} mins
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-slate-900 tabular-nums">₹{item.price}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            PAGE 8: ADMIN DASHBOARD (SECURE & PROFESSIONAL)
           ======================================================== */}
        {currentPage === 'admin' && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            {currentUser?.role !== 'ADMIN' ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
                <p className="text-sm text-slate-500 mb-6">You must be signed in with administrator credentials to view this console.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                >
                  Switch to Admin Account
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Merchant & Operations Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Manage orders, live food catalog availability, and platform sync
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => showToast('Catalog availability and prices synchronized successfully')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync & Refresh Catalog
                    </button>
                  </div>
                </div>

                {/* Operations KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{orders.length}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Platform Sales</div>
                    <div className="text-2xl font-extrabold text-orange-600 mt-1 tabular-nums">
                      ₹{orders.filter(o => o.orderStatus !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0).toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Restaurants</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{restaurants.length}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dishes in Catalog</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{foodItems.length}</div>
                  </div>
                </div>

                {/* Orders Lifecycle Table */}
                <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Orders Pipeline</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 text-slate-400 font-bold pb-2">
                        <tr>
                          <th className="pb-3">Order Number</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Restaurant</th>
                          <th className="pb-3">Total Amount</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map(o => (
                          <tr key={o.id}>
                            <td className="py-3 font-bold text-slate-900">{o.orderNumber}</td>
                            <td className="py-3 text-slate-600">{o.customerName}</td>
                            <td className="py-3 text-slate-600">{o.restaurantName}</td>
                            <td className="py-3 font-bold tabular-nums">₹{o.totalAmount.toFixed(2)}</td>
                            <td className="py-3">
                              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                {o.orderStatus}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <select
                                value={o.orderStatus}
                                onChange={(e) => {
                                  const newStatus = e.target.value as any;
                                  setOrders(prev => prev.map(ord => ord.id === o.id ? { ...ord, orderStatus: newStatus } : ord));
                                  showToast(`Updated status to ${newStatus}`);
                                }}
                                className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white outline-none cursor-pointer"
                              >
                                <option value="ORDER_PLACED">ORDER_PLACED</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PREPARING">PREPARING</option>
                                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Food Catalog Stock Management */}
                <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Food Menu Stock & Pricing Management
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Toggle dish availability or update prices. Changes sync immediately.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 text-slate-400 font-bold pb-2">
                        <tr>
                          <th className="pb-3">Dish</th>
                          <th className="pb-3">Restaurant</th>
                          <th className="pb-3">Price (₹)</th>
                          <th className="pb-3">Availability</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {foodItems.slice(0, 8).map(food => (
                          <tr key={food.id} className="py-2.5">
                            <td className="py-3 font-bold text-slate-900">{food.name}</td>
                            <td className="py-3 text-slate-500">{food.restaurantName}</td>
                            <td className="py-3 font-semibold tabular-nums">₹{food.price}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${food.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {food.available ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              <button
                                onClick={() => toggleItemAvailability(food.id)}
                                className="text-xs font-semibold px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                              >
                                Toggle Stock
                              </button>
                              <button
                                onClick={() => {
                                  const p = prompt('Enter new price (₹):', food.price.toString());
                                  if (p && !isNaN(Number(p))) updateItemPrice(food.id, Number(p));
                                }}
                                className="text-xs font-semibold px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                              >
                                Edit Price
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Customer-Oriented Clean Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs text-slate-500">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white font-extrabold text-xs">
                FN
              </div>
              <span className="font-extrabold text-base text-slate-900">FoodNest</span>
            </div>
            <p className="leading-relaxed text-slate-500 max-w-xs">
              Your Cravings, Delivered with Love. Order your favourite dishes from verified restaurants with fast doorstep delivery.
            </p>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Discover</div>
            <ul className="space-y-2">
              <li><button onClick={() => { setCategoryFilter('all'); setCurrentPage('restaurants'); }} className="hover:text-orange-600 cursor-pointer">All Restaurants</button></li>
              <li><button onClick={() => setCurrentPage('smartbite')} className="hover:text-orange-600 cursor-pointer">SmartBite Recommendations</button></li>
              <li><button onClick={() => { setCategoryFilter('Biryani'); setCurrentPage('restaurants'); }} className="hover:text-orange-600 cursor-pointer">Biryani Specials</button></li>
              <li><button onClick={() => { setCategoryFilter('South Indian'); setCurrentPage('restaurants'); }} className="hover:text-orange-600 cursor-pointer">South Indian Classics</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Customer Support</div>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentPage('orders')} className="hover:text-orange-600 cursor-pointer">Track Orders</button></li>
              <li><span className="text-slate-500">Help & FAQs</span></li>
              <li><span className="text-slate-500">Cancellation & Refunds</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Contact FoodNest</div>
            <div className="space-y-2 text-slate-500">
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-orange-600" /> Bengaluru, Karnataka, India</div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-orange-600" /> +91 98888 77777</div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-orange-600" /> support@foodnest.com</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; 2026 FoodNest Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
