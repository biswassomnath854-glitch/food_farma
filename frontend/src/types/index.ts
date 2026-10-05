export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  image: string;
  description?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  image?: string;
  address?: string;
  cuisines?: string;
  location?: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder?: number;
  status: 'OPEN' | 'CLOSED' | 'INACTIVE';
  isOpen?: boolean;
  foods?: Food[];
  reviews?: Review[];
}

export interface Food {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  foodType: 'VEG' | 'NON_VEG';
  rating: number;
  isAvailable: boolean;
  restaurant?: Restaurant;
  category?: Category;
}

export interface CartItemType {
  id: string;
  cartId: string;
  foodId: string;
  quantity: number;
  food?: Food;
}

export interface CartType {
  id: string;
  userId: string;
  items: CartItemType[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
}

export interface AddressType {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface OrderItemType {
  id: string;
  orderId: string;
  foodId: string;
  foodName: string;
  price: number;
  quantity: number;
  foodType: 'VEG' | 'NON_VEG';
}

export interface PaymentType {
  id: string;
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  method?: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface OrderType {
  id: string;
  userId: string;
  restaurantId: string;
  addressId?: string;
  deliveryAddress?: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'ONLINE' | 'COD';
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  deliveryInstructions?: string;
  items?: OrderItemType[];
  restaurant?: Restaurant;
  payment?: PaymentType;
  user?: User;
  address?: AddressType;
  review?: Review;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  comment?: string;
  user?: { id: string; name: string };
  createdAt?: string;
}
