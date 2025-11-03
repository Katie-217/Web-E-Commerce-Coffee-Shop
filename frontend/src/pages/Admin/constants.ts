import { Product, Order, OrderDetail, User, ProductStatus, OrderStatus, Category } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Ethiopian Yirgacheffe', imageUrl: 'https://picsum.photos/seed/p1/40/40', description: 'Bright, citrusy, and floral single-origin beans.', category: 'Coffee Beans', stock: true, sku: 'SKU31063', price: 22.50, quantity: 150, status: ProductStatus.Publish },
  { id: 2, name: 'Colombian Supremo', imageUrl: 'https://picsum.photos/seed/p2/40/40', description: 'Smooth with notes of chocolate and nuts.', category: 'Coffee Beans', stock: true, sku: 'SKU5829', price: 19.99, quantity: 200, status: ProductStatus.Publish },
  { id: 3, name: 'Hario V60 Dripper', imageUrl: 'https://picsum.photos/seed/p3/40/40', description: 'Ceramic pour-over coffee maker.', category: 'Equipment', stock: false, sku: 'SKU35946', price: 25.00, quantity: 0, status: ProductStatus.Inactive },
  { id: 4, name: 'Chemex Classic 6-Cup', imageUrl: 'https://picsum.photos/seed/p4/40/40', description: 'Elegant glass coffee maker.', category: 'Equipment', stock: true, sku: 'SKU46658', price: 45.00, quantity: 75, status: ProductStatus.Publish },
  { id: 5, name: 'Espresso Blend', imageUrl: 'https://picsum.photos/seed/p5/40/40', description: 'Dark roast, perfect for a rich espresso shot.', category: 'Ground Coffee', stock: true, sku: 'SKU41867', price: 18.75, quantity: 300, status: ProductStatus.Publish },
  { id: 6, name: 'Coffee Shop Mug', imageUrl: 'https://picsum.photos/seed/p6/40/40', description: '12oz branded ceramic mug.', category: 'Merchandise', stock: false, sku: 'SKU63474', price: 12.00, quantity: 0, status: ProductStatus.Inactive },
  { id: 7, name: 'Sumatra Mandheling', imageUrl: 'https://picsum.photos/seed/p7/40/40', description: 'Earthy, full-bodied, and low acidity.', category: 'Coffee Beans', stock: true, sku: 'SKU29540', price: 21.00, quantity: 120, status: ProductStatus.Publish },
];

export const MOCK_ORDERS: Order[] = [
    { id: '#6979', date: 'Apr 15, 2023, 10:21', customer: { name: 'Cristine Easom', avatar: 'https://picsum.photos/seed/u1/32/32', email: 'ceasom@guardian.com' }, payment: 125.50, status: OrderStatus.Pending, paymentMethod: { type: 'Mastercard', last4: '2356' }, paymentStatus: 'Pending' },
    { id: '#6624', date: 'Apr 17, 2023, 6:43', customer: { name: 'Fayre Screech', avatar: 'https://picsum.photos/seed/u2/32/32', email: 'fscreech@army.mil' }, payment: 89.99, status: OrderStatus.Delivered, paymentMethod: { type: 'Visa', last4: '2077' }, paymentStatus: 'Failed' },
    { id: '#9305', date: 'Apr 17, 2023, 8:05', customer: { name: 'Pauline Pfaffe', avatar: 'https://picsum.photos/seed/u3/32/32', email: 'ppfaffe@yahoo.com' }, payment: 45.00, status: OrderStatus.Delivered, paymentMethod: { type: 'Mastercard', last4: '2077' }, paymentStatus: 'Paid' },
    { id: '#8005', date: 'Apr 22, 2023, 3:01', customer: { name: 'Maurits Nealey', avatar: 'https://picsum.photos/seed/u4/32/32', email: 'mnealey@ispg.com' }, payment: 210.00, status: OrderStatus.Processing, paymentMethod: { type: 'Visa', last4: '1555' }, paymentStatus: 'Paid' },
    { id: '#5859', date: 'Apr 29, 2023, 9:52', customer: { name: 'Eydie Vogelein', avatar: 'https://picsum.photos/seed/u5/32/32', email: 'evogelein@gen.com' }, payment: 32.50, status: OrderStatus.Delivered, paymentMethod: { type: 'Mastercard', last4: '5851' }, paymentStatus: 'Paid' },
    { id: '#8114', date: 'May 8, 2023, 8:14', customer: { name: 'Hillard Merck', avatar: 'https://picsum.photos/seed/u6/32/32', email: 'hmerck@printfriendly.com' }, payment: 76.80, status: OrderStatus.Cancelled, paymentMethod: { type: 'Visa', last4: '3507' }, paymentStatus: 'Refunded' },
    { id: '#6890', date: 'May 1, 2023, 7:24', customer: { name: 'Eduard Duke', avatar: 'https://picsum.photos/seed/u7/32/32', email: 'eduke@cnet.com' }, payment: 15.00, status: OrderStatus.Delivered, paymentMethod: { type: 'Mastercard', last4: '5851' }, paymentStatus: 'Paid' },
    { id: '#32543', date: 'Aug 17, 2025, 5:48', customer: { name: 'Shamus Tuttle', avatar: 'https://picsum.photos/seed/u8/32/32', email: 'Shamus889@yahoo.com', id: '#58909', phone: '+1 (609) 972-22-22', totalOrders: 12 }, payment: 2113.00, status: OrderStatus.Processing, paymentMethod: { type: 'Mastercard', last4: '4291' }, paymentStatus: 'Paid' },
];

export const MOCK_ORDER_DETAILS: { [key: string]: OrderDetail } = {
  '#32543': {
    id: '#32543',
    date: 'Aug 17, 2025, 5:48 (ET)',
    customer: {
      name: 'Shamus Tuttle',
      avatar: 'https://picsum.photos/seed/u8/80/80',
      email: 'Shamus889@yahoo.com',
      id: '#58909',
      phone: '+1 (609) 972-22-22',
      totalOrders: 12,
    },
    payment: 2113.00,
    status: OrderStatus.Processing,
    paymentMethod: { type: 'Mastercard', last4: '4291' },
    paymentStatus: 'Paid',
    items: [
      { id: 1, name: 'Oneplus 10', variant: 'Storage:128gb', price: 896, quantity: 3 },
      { id: 2, name: 'Nike Jordan', variant: 'Size:8UK', price: 392, quantity: 1 },
      { id: 3, name: 'Wooden Chair', variant: 'Material: Wooden', price: 841, quantity: 2 },
      { id: 4, name: 'Face cream', variant: 'Gender:Women', price: 813, quantity: 2 },
    ],
    subtotal: 6386,
    discount: 2,
    tax: 28,
    total: 2113,
    shippingActivity: [
      { status: 'Order was placed', description: 'Your order has been placed successfully', completed: true },
      { status: 'Pick-up', description: 'Pick-up scheduled with courier', date: 'Tuesday', time: '11:29 AM', completed: true },
      { status: 'Dispatched', description: 'Item has been picked up by courier', date: 'Wednesday', time: '11:29 AM', completed: true },
      { status: 'Package arrived', description: 'Package arrived at an Amazon facility, NY', date: 'Thursday', time: '11:29 AM', completed: true },
      { status: 'Dispatched for delivery', description: 'Package has left an Amazon facility, NY', date: 'Saturday', time: '15:20 AM', completed: true },
      { status: 'Delivery', description: 'Package will be delivered by tomorrow', date: 'Today', time: '14:12 PM', completed: false },
    ],
    shippingAddress: {
      street: '45 Roker Terrace, Latheronwheel',
      city: 'London',
      state: '',
      zip: 'KW5 8NW',
      country: 'UK',
    },
    billingAddress: {
      street: '45 Roker Terrace, Latheronwheel',
      city: 'London',
      state: '',
      zip: 'KW5 8NW',
      country: 'UK',
    },
  },
};

export const MOCK_USERS: User[] = [
    { id: 1, name: 'John Doe', avatar: 'https://picsum.photos/seed/u1/40/40', email: 'john.doe@example.com', role: 'Admin', lastLogin: '2023-10-27 10:00 AM', status: 'Active' },
    { id: 2, name: 'Jane Smith', avatar: 'https://picsum.photos/seed/u2/40/40', email: 'jane.smith@example.com', role: 'Member', lastLogin: '2023-10-27 09:45 AM', status: 'Active' },
    { id: 3, name: 'Mike Johnson', avatar: 'https://picsum.photos/seed/u3/40/40', email: 'mike.j@example.com', role: 'Member', lastLogin: '2023-10-26 03:12 PM', status: 'Inactive' },
    { id: 4, name: 'Emily Davis', avatar: 'https://picsum.photos/seed/u4/40/40', email: 'emily.d@example.com', role: 'Member', lastLogin: '2023-10-27 11:20 AM', status: 'Active' },
    { id: 5, name: 'Chris Brown', avatar: 'https://picsum.photos/seed/u5/40/40', email: 'chris.b@example.com', role: 'Guest', lastLogin: '2023-10-25 08:00 AM', status: 'Inactive' },
    { id: 6, name: 'Sarah Wilson', avatar: 'https://picsum.photos/seed/u6/40/40', email: 'sarah.w@example.com', role: 'Admin', lastLogin: '2023-10-27 12:01 PM', status: 'Active' },
];

export const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: 'Coffee Beans', productCount: 12, status: 'Active' },
    { id: 2, name: 'Ground Coffee', productCount: 8, status: 'Active' },
    { id: 3, name: 'Equipment', productCount: 25, status: 'Active' },
    { id: 4, name: 'Merchandise', productCount: 5, status: 'Inactive' },
    { id: 5, name: 'Syrups & Sauces', productCount: 15, status: 'Active' },
];


export const DASHBOARD_STATS = [
  { title: "In-store Sales", value: "$5,345.43", change: "+5.7%", changeType: "increase", icon: "store" },
  { title: "Website Sales", value: "$674,347.12", change: "+12.4%", changeType: "increase", icon: "website" },
  { title: "Discount", value: "$14,235.12", change: "", changeType: "none", icon: "discount" },
  { "title": "Affiliate", "value": "$8,345.23", "change": "-3.5%", "changeType": "decrease", "icon": "affiliate" },
];

export const REVENUE_DATA = [
  { name: 'Jan', Earning: 280, Expense: 100 },
  { name: 'Feb', Earning: 200, Expense: 150 },
  { name: 'Mar', Earning: 250, Expense: 80 },
  { name: 'Apr', Earning: 220, Expense: 180 },
  { name: 'May', Earning: 300, Expense: 120 },
  { name: 'Jun', Earning: 260, Expense: 140 },
  { name: 'Jul', Earning: 290, Expense: 110 },
  { name: 'Aug', Earning: 240, Expense: 190 },
  { name: 'Sep', Earning: 270, Expense: 130 },
];