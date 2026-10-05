import { User } from './User';
import { Restaurant } from './Restaurant';
import { Category } from './Category';
import { Food } from './Food';
import { Cart } from './Cart';
import { CartItem } from './CartItem';
import { Address } from './Address';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { Payment } from './Payment';
import { RefreshToken } from './RefreshToken';
import { Review } from './Review';

// User Relationships
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart & CartItem Relationships
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

Food.hasMany(CartItem, { foreignKey: 'foodId', as: 'cartItems', onDelete: 'CASCADE' });
CartItem.belongsTo(Food, { foreignKey: 'foodId', as: 'food' });

// Restaurant & Category & Food Relationships
Restaurant.hasMany(Food, { foreignKey: 'restaurantId', as: 'foods', onDelete: 'CASCADE' });
Food.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Category.hasMany(Food, { foreignKey: 'categoryId', as: 'foods', onDelete: 'RESTRICT' });
Food.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Restaurant.hasMany(Review, { foreignKey: 'restaurantId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Order & OrderItem & Address & Payment Relationships
Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders', onDelete: 'RESTRICT' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Address.hasMany(Order, { foreignKey: 'addressId', as: 'orders', onDelete: 'SET NULL' });
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Food.hasMany(OrderItem, { foreignKey: 'foodId', as: 'orderItems', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Food, { foreignKey: 'foodId', as: 'food' });

Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Order.hasOne(Review, { foreignKey: 'orderId', as: 'review', onDelete: 'SET NULL' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

export {
  User,
  Restaurant,
  Category,
  Food,
  Cart,
  CartItem,
  Address,
  Order,
  OrderItem,
  Payment,
  RefreshToken,
  Review,
};

export type { OrderStatus, PaymentMethod, PaymentStatus } from './Order';
