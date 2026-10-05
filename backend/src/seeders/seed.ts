import { connectDatabase, sequelize } from '../config/database';
import { User, Restaurant, Category, Food, Cart, Address, Review } from '../models';
import { hashPassword } from '../utils/password';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Database Seeding process...');
    await connectDatabase();

    // Sync database and recreate tables for clean seed
    await sequelize.sync({ force: true });
    console.log('🧹 Cleaned existing database tables.');

    // 1. Create Admin & Customer Users
    const adminPassword = await hashPassword('admin123');
    const userPassword = await hashPassword('user123');

    const admin = await User.create({
      name: 'EatNBite Admin',
      email: 'admin@foodfarma.com',
      password: adminPassword,
      phone: '9876543210',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const user = await User.create({
      name: 'Sagar Kumar',
      email: 'user@foodfarma.com',
      password: userPassword,
      phone: '9123456789',
      role: 'USER',
      status: 'ACTIVE',
    });

    console.log('👤 Created default Admin & User accounts.');

    // 2. Create User Cart & Default Address
    await Cart.create({ userId: user.id });

    const defaultAddress = await Address.create({
      userId: user.id,
      fullName: 'Sagar Kumar',
      phone: '9123456789',
      addressLine: 'College Para, Near Town Hall',
      city: 'Basirhat',
      state: 'West Bengal',
      pincode: '743411',
      isDefault: true,
    });

    console.log('🏡 Created user cart and default delivery address.');

    // 3. Create Categories
    const categoriesData = [
      {
        name: 'Pizza',
        slug: 'pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop',
        description: 'Cheesy & delicious artisanal pizzas',
      },
      {
        name: 'Burger',
        slug: 'burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',
        description: 'Juicy burgers stacked with fresh ingredients',
      },
      {
        name: 'Biryani',
        slug: 'biryani',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop',
        description: 'Aromatic & flavorful hyderabadi biryanis',
      },
      {
        name: 'Chinese',
        slug: 'chinese',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop',
        description: 'Sizzling noodles, dim sums & Manchurian',
      },
      {
        name: 'Desserts',
        slug: 'desserts',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop',
        description: 'Sweet indulgences, ice creams & pastries',
      },
      {
        name: 'Beverages',
        slug: 'beverages',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop',
        description: 'Refreshing shakes, boba & cold brews',
      },
    ];

    const categories = await Category.bulkCreate(categoriesData);
    const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
    console.log('🍕 Created Food Categories.');

    // 4. Create Restaurants
    const restaurantsData = [
      {
        name: 'Royal Biryani House',
        description: 'Authentic Nawabi & Hyderabadi Dum Biryanis cooked with aromatic spices.',
        address: '12 Taki Road, Basirhat, West Bengal',
        location: 'Taki Road, Basirhat',
        cuisines: 'Biryani, Mughlai, Kebabs',
        rating: 4.8,
        deliveryTime: '25-35 min',
        deliveryFee: 30,
        minOrder: 150,
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop',
        logo: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=100&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop',
        status: 'OPEN' as const,
        isOpen: true,
      },
      {
        name: 'Pizza Paradise',
        description: 'Wood-fired Authentic Neapolitan & Loaded Cheese Crust Pizzas.',
        address: '45 Itinda Road, Basirhat, West Bengal',
        location: 'Itinda Road, Basirhat',
        cuisines: 'Pizza, Italian, Fast Food',
        rating: 4.6,
        deliveryTime: '30-40 min',
        deliveryFee: 30,
        minOrder: 200,
        image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=500&auto=format&fit=crop',
        logo: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=100&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=500&auto=format&fit=crop',
        status: 'OPEN' as const,
        isOpen: true,
      },
      {
        name: 'The Burger Club',
        description: 'Gourmet smashed patties, crisp veggies & signature house sauces.',
        address: '88 Station Road, Basirhat, West Bengal',
        location: 'Station Road, Basirhat',
        cuisines: 'Burger, American, Shakes',
        rating: 4.7,
        deliveryTime: '20-30 min',
        deliveryFee: 25,
        minOrder: 120,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop',
        logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop',
        status: 'OPEN' as const,
        isOpen: true,
      },
      {
        name: 'Dragon Wok Asian',
        description: 'Fiery wok-tossed noodles, spicy Schezwan & crispy appetizers.',
        address: '102 College Para, Basirhat, West Bengal',
        location: 'College Para, Basirhat',
        cuisines: 'Chinese, Pan-Asian, Noodles',
        rating: 4.5,
        deliveryTime: '35-45 min',
        deliveryFee: 35,
        minOrder: 180,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop',
        logo: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=100&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop',
        status: 'OPEN' as const,
        isOpen: true,
      },
      {
        name: 'Tandoori Nights & Curry House',
        description: 'Rich creamy butter chicken, smoky tandoori kebabs & fresh garlic naans.',
        address: '77 Basirhat Main Market, West Bengal',
        location: 'Main Market, Basirhat',
        cuisines: 'North Indian, Kebabs, Tandoori',
        rating: 4.9,
        deliveryTime: '25-35 min',
        deliveryFee: 30,
        minOrder: 200,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop',
        logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop',
        status: 'OPEN' as const,
        isOpen: true,
      },
      {
        name: 'Sushi & Dimsum Lounge',
        description: 'Authentic Japanese hand-rolled sushi, truffle dim sums & ramen bowls.',
        address: '15 Old Market Road, Basirhat, West Bengal',
        location: 'Old Market, Basirhat',
        cuisines: 'Japanese, Sushi, Asian',
        rating: 4.8,
        deliveryTime: '30-40 min',
        deliveryFee: 40,
        minOrder: 350,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop',
        logo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop',
        status: 'OPEN' as const,
        isOpen: true,
      },
    ];

    const restaurants = await Restaurant.bulkCreate(restaurantsData);
    const rMap = new Map(restaurants.map((r) => [r.name, r.id]));
    console.log('🏪 Created Restaurants.');

    // 5. Create Foods
    const foodsData = [
      // Biryani House Foods
      {
        restaurantId: rMap.get('Royal Biryani House')!,
        categoryId: categoryMap.get('Biryani')!,
        name: 'Special Chicken Dum Biryani',
        description: 'Tender chicken pieces marinated overnight in rich spices dum-cooked with long grain basmati rice.',
        price: 349,
        discountPrice: 299,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop',
        foodType: 'NON_VEG' as const,
        rating: 4.9,
        isAvailable: true,
      },
      {
        restaurantId: rMap.get('Royal Biryani House')!,
        categoryId: categoryMap.get('Biryani')!,
        name: 'Paneer Tikka Dum Biryani',
        description: 'Smoky grilled paneer cubes layered with fragrant saffron rice and caramelized onions.',
        price: 289,
        discountPrice: 249,
        image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.7,
        isAvailable: true,
      },
      // Pizza Paradise Foods
      {
        restaurantId: rMap.get('Pizza Paradise')!,
        categoryId: categoryMap.get('Pizza')!,
        name: 'Farmhouse Loaded Pizza (Medium)',
        description: 'Loaded with crunchy capsicum, sweet corn, fresh tomatoes, mushrooms & extra mozzarella.',
        price: 499,
        discountPrice: 429,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.8,
        isAvailable: true,
      },
      {
        restaurantId: rMap.get('Pizza Paradise')!,
        categoryId: categoryMap.get('Pizza')!,
        name: 'Fiery Pepperoni Feast',
        description: 'Spicy pepperoni slices over zesty tomato marinara base with double molten cheese.',
        price: 599,
        discountPrice: 529,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop',
        foodType: 'NON_VEG' as const,
        rating: 4.9,
        isAvailable: true,
      },
      // The Burger Club Foods
      {
        restaurantId: rMap.get('The Burger Club')!,
        categoryId: categoryMap.get('Burger')!,
        name: 'Double Cheese Smash Burger',
        description: 'Two crispy beef/chicken patties, double cheddar cheese, pickles, and secret club sauce.',
        price: 249,
        discountPrice: 199,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',
        foodType: 'NON_VEG' as const,
        rating: 4.8,
        isAvailable: true,
      },
      {
        restaurantId: rMap.get('The Burger Club')!,
        categoryId: categoryMap.get('Burger')!,
        name: 'Crispy Veg Supreme Burger',
        description: 'Golden spiced potato & corn patty with creamy herb mayo and crunchy lettuce in brioche bun.',
        price: 179,
        discountPrice: 149,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.6,
        isAvailable: true,
      },
      // Dragon Wok Foods
      {
        restaurantId: rMap.get('Dragon Wok Asian')!,
        categoryId: categoryMap.get('Chinese')!,
        name: 'Schezwan Hakka Noodles',
        description: 'Wok-tossed stir fry noodles with crunchy bell peppers, cabbage and spicy garlic Schezwan sauce.',
        price: 219,
        discountPrice: 189,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.5,
        isAvailable: true,
      },
      // Tandoori Nights Foods
      {
        restaurantId: rMap.get('Tandoori Nights & Curry House')!,
        categoryId: categoryMap.get('Biryani')!,
        name: 'Butter Chicken Supreme',
        description: 'Tender tandoori chicken simmered in rich velvet tomato-butter cream gravy.',
        price: 389,
        discountPrice: 339,
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop',
        foodType: 'NON_VEG' as const,
        rating: 4.9,
        isAvailable: true,
      },
      {
        restaurantId: rMap.get('Tandoori Nights & Curry House')!,
        categoryId: categoryMap.get('Biryani')!,
        name: 'Dal Makhani & Garlic Naan',
        description: 'Slow-cooked black lentils simmered overnight with butter and fresh garlic naan bread.',
        price: 269,
        discountPrice: 229,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.8,
        isAvailable: true,
      },
      // Sushi & Dimsum Lounge Foods
      {
        restaurantId: rMap.get('Sushi & Dimsum Lounge')!,
        categoryId: categoryMap.get('Chinese')!,
        name: 'Crunchy Prawn Tempura Roll',
        description: 'Crispy prawn tempura, avocado, nori wrap topped with spicy mayo & sesame seeds.',
        price: 449,
        discountPrice: 399,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop',
        foodType: 'NON_VEG' as const,
        rating: 4.9,
        isAvailable: true,
      },
      {
        restaurantId: rMap.get('Sushi & Dimsum Lounge')!,
        categoryId: categoryMap.get('Chinese')!,
        name: 'Steamed Truffle Edamame Dimsums',
        description: 'Delicate crystal dumplings stuffed with edamame puree and truffle oil spray.',
        price: 349,
        discountPrice: 299,
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.7,
        isAvailable: true,
      },
      // Beverages & Desserts
      {
        restaurantId: rMap.get('The Burger Club')!,
        categoryId: categoryMap.get('Beverages')!,
        name: 'Belgian Dark Chocolate Shake',
        description: 'Thick creamy milkshake blended with premium dark Belgian chocolate and topped with cocoa powder.',
        price: 169,
        discountPrice: 139,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.9,
        isAvailable: true,
      },
      {
        restaurantId: rMap.get('Pizza Paradise')!,
        categoryId: categoryMap.get('Desserts')!,
        name: 'Choco Lava Molten Cake',
        description: 'Warm chocolate cake filled with gooey melted chocolate center.',
        price: 129,
        discountPrice: 99,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop',
        foodType: 'VEG' as const,
        rating: 4.8,
        isAvailable: true,
      },
    ];

    await Food.bulkCreate(foodsData);
    console.log('🍲 Created Food items.');

    // 6. Create Reviews
    await Review.create({
      userId: user.id,
      restaurantId: rMap.get('Royal Biryani House')!,
      rating: 5,
      comment: 'Best biryani in town! The rice was fragrant and chicken was super tender.',
    });

    console.log('⭐ Created Sample Reviews.');
    console.log('✅ Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();
