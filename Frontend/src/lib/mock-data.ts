import { Customer, Order, Offer, CMSPage, Payment, Inquiry } from '@/types';

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 9876543210', address: '123 MG Road, Delhi', is_blocked: false, is_active: true, last_activity: '2025-09-30T10:00:00Z', created_at: '2025-01-15T10:00:00Z' },
  { id: '2', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 9876543211', address: '456 Park Street, Mumbai', is_blocked: false, is_active: true, last_activity: '2025-09-29T12:30:00Z', created_at: '2025-02-10T11:30:00Z' },
  { id: '3', name: 'Amit Patel', email: 'amit@example.com', phone: '+91 9876543212', address: '789 FC Road, Pune', is_blocked: false, is_active: true, last_activity: '2025-09-29T14:15:00Z', created_at: '2025-03-05T09:15:00Z' },
  { id: '4', name: 'Sneha Gupta', email: 'sneha@example.com', phone: '+91 9876543213', address: '321 Brigade Road, Bangalore', is_blocked: true, is_active: false, last_activity: '2025-08-15T14:20:00Z', created_at: '2025-03-20T14:20:00Z' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 9876543214', address: '654 Anna Salai, Chennai', is_blocked: false, is_active: true, last_activity: '2025-09-30T09:00:00Z', created_at: '2025-04-12T16:45:00Z' },
  { id: '6', name: 'Ananya Reddy', email: 'ananya@example.com', phone: '+91 9876543215', address: '987 Jubilee Hills, Hyderabad', is_blocked: false, is_active: true, last_activity: '2025-09-30T11:45:00Z', created_at: '2025-05-08T08:30:00Z' },
  { id: '7', name: 'Karan Mehta', email: 'karan@example.com', phone: '+91 9876543216', address: '147 CG Road, Ahmedabad', is_blocked: false, is_active: true, last_activity: '2025-09-27T15:30:00Z', created_at: '2025-06-14T12:00:00Z' },
  { id: '8', name: 'Neha Joshi', email: 'neha@example.com', phone: '+91 9876543217', address: '258 Lal Darwaja, Jaipur', is_blocked: false, is_active: false, last_activity: '2025-08-20T15:30:00Z', created_at: '2025-07-22T15:30:00Z' },
  { id: '9', name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91 9876543218', address: '369 Gomti Nagar, Lucknow', is_blocked: false, is_active: false, last_activity: '2025-08-10T10:45:00Z', created_at: '2025-08-05T10:45:00Z' },
  { id: '10', name: 'Pooja Kapoor', email: 'pooja@example.com', phone: '+91 9876543219', address: '741 Mall Road, Chandigarh', is_blocked: false, is_active: true, last_activity: '2025-09-24T16:50:00Z', created_at: '2025-09-01T13:20:00Z' },
];


export const mockOrders: Order[] = [
  { id: '1', order_number: 'ORD001', customer_id: '1', customer_name: 'Rajesh Kumar', total_amount: 1062, subtotal: 900, gst_amount: 162, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'delivery', delivery_address: '123 MG Road, Delhi', items: [{ id: '1', order_id: '1', menu_item_id: '1', menu_item_name: 'Hyderabadi Mutton Biryani', quantity: 2, price: 450 }], created_at: '2025-09-28T10:00:00Z' },
  { id: '2', order_number: 'ORD002', customer_id: '2', customer_name: 'Priya Sharma', total_amount: 826, subtotal: 700, gst_amount: 126, delivery_charges: 0, service_charges: 0, status: 'out_for_delivery', order_type: 'delivery', delivery_address: '456 Park Street, Mumbai', items: [{ id: '3', order_id: '2', menu_item_id: '2', menu_item_name: 'Chicken Biryani', quantity: 2, price: 350 }], created_at: '2025-09-29T12:30:00Z' },
  { id: '3', order_number: 'ORD003', customer_id: '3', customer_name: 'Amit Patel', total_amount: 1416, subtotal: 1200, gst_amount: 216, delivery_charges: 0, service_charges: 0, status: 'preparing', order_type: 'pickup', delivery_address: '789 FC Road, Pune', items: [{ id: '4', order_id: '3', menu_item_id: '3', menu_item_name: 'Hyderabadi Chicken Biryani', quantity: 2, price: 380 }, { id: '5', order_id: '3', menu_item_id: '12', menu_item_name: 'Dal Makhani', quantity: 1, price: 200 }, { id: '6', order_id: '3', menu_item_id: '25', menu_item_name: 'Gulab Jamun', quantity: 20, price: 8 }], created_at: '2025-09-29T14:15:00Z' },
  { id: '4', order_number: 'ORD004', customer_id: '5', customer_name: 'Vikram Singh', total_amount: 944, subtotal: 800, gst_amount: 144, delivery_charges: 0, service_charges: 0, status: 'confirmed', order_type: 'delivery', delivery_address: '654 Anna Salai, Chennai', items: [{ id: '7', order_id: '4', menu_item_id: '9', menu_item_name: 'Butter Chicken', quantity: 2, price: 350 }, { id: '8', order_id: '4', menu_item_id: '18', menu_item_name: 'Butter Naan', quantity: 20, price: 25 }], created_at: '2025-09-30T09:00:00Z' },
  { id: '5', order_number: 'ORD005', customer_id: '6', customer_name: 'Ananya Reddy', total_amount: 661, subtotal: 560, gst_amount: 101, delivery_charges: 0, service_charges: 0, status: 'pending', order_type: 'pickup', delivery_address: '987 Jubilee Hills, Hyderabad', items: [{ id: '9', order_id: '5', menu_item_id: '23', menu_item_name: 'Paneer Tikka', quantity: 2, price: 280 }], created_at: '2025-09-30T11:45:00Z' },
  { id: '6', order_number: 'ORD006', customer_id: '7', customer_name: 'Karan Mehta', total_amount: 991, subtotal: 840, gst_amount: 151, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'delivery', delivery_address: '147 CG Road, Ahmedabad', items: [{ id: '10', order_id: '6', menu_item_id: '4', menu_item_name: 'Mutton Biryani', quantity: 2, price: 420 }], created_at: '2025-09-27T15:30:00Z' },
  { id: '7', order_number: 'ORD007', customer_id: '8', customer_name: 'Neha Joshi', total_amount: 767, subtotal: 650, gst_amount: 117, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'pickup', delivery_address: '258 Lal Darwaja, Jaipur', items: [{ id: '11', order_id: '7', menu_item_id: '5', menu_item_name: 'Veg Biryani', quantity: 2, price: 250 }, { id: '12', order_id: '7', menu_item_id: '28', menu_item_name: 'Mango Lassi', quantity: 2, price: 80 }], created_at: '2025-09-26T08:20:00Z' },
  { id: '8', order_number: 'ORD008', customer_id: '9', customer_name: 'Rahul Verma', total_amount: 897, subtotal: 760, gst_amount: 137, delivery_charges: 0, service_charges: 0, status: 'cancelled', order_type: 'delivery', delivery_address: '369 Gomti Nagar, Lucknow', items: [{ id: '13', order_id: '8', menu_item_id: '21', menu_item_name: 'Tandoori Chicken', quantity: 2, price: 380 }], created_at: '2025-09-25T13:10:00Z' },
  { id: '9', order_number: 'ORD009', customer_id: '10', customer_name: 'Pooja Kapoor', total_amount: 472, subtotal: 400, gst_amount: 72, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'pickup', delivery_address: '741 Mall Road, Chandigarh', items: [{ id: '14', order_id: '9', menu_item_id: '12', menu_item_name: 'Dal Makhani', quantity: 2, price: 200 }], created_at: '2025-09-24T16:50:00Z' },
  { id: '10', order_number: 'ORD010', customer_id: '1', customer_name: 'Rajesh Kumar', total_amount: 779, subtotal: 660, gst_amount: 119, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'delivery', delivery_address: '123 MG Road, Delhi', items: [{ id: '15', order_id: '10', menu_item_id: '23', menu_item_name: 'Paneer Tikka', quantity: 1, price: 280 }, { id: '16', order_id: '10', menu_item_id: '21', menu_item_name: 'Tandoori Chicken', quantity: 1, price: 380 }], created_at: '2025-09-23T12:00:00Z' },
  { id: '11', order_number: 'ORD011', customer_id: '2', customer_name: 'Priya Sharma', total_amount: 826, subtotal: 700, gst_amount: 126, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'pickup', delivery_address: '456 Park Street, Mumbai', items: [{ id: '17', order_id: '11', menu_item_id: '9', menu_item_name: 'Butter Chicken', quantity: 2, price: 350 }], created_at: '2025-09-22T10:30:00Z' },
  { id: '12', order_number: 'ORD012', customer_id: '3', customer_name: 'Amit Patel', total_amount: 590, subtotal: 500, gst_amount: 90, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'delivery', delivery_address: '789 FC Road, Pune', items: [{ id: '18', order_id: '12', menu_item_id: '5', menu_item_name: 'Veg Biryani', quantity: 2, price: 250 }], created_at: '2025-09-21T14:20:00Z' },
  { id: '13', order_number: 'ORD013', customer_id: '5', customer_name: 'Vikram Singh', total_amount: 944, subtotal: 800, gst_amount: 144, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'pickup', delivery_address: '654 Anna Salai, Chennai', items: [{ id: '19', order_id: '13', menu_item_id: '2', menu_item_name: 'Chicken Biryani', quantity: 2, price: 350 }, { id: '20', order_id: '13', menu_item_id: '25', menu_item_name: 'Gulab Jamun', quantity: 25, price: 8 }], created_at: '2025-09-20T11:00:00Z' },
  { id: '14', order_number: 'ORD014', customer_id: '6', customer_name: 'Ananya Reddy', total_amount: 1156, subtotal: 980, gst_amount: 176, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'delivery', delivery_address: '987 Jubilee Hills, Hyderabad', items: [{ id: '21', order_id: '14', menu_item_id: '9', menu_item_name: 'Butter Chicken', quantity: 1, price: 350 }, { id: '22', order_id: '14', menu_item_id: '23', menu_item_name: 'Paneer Tikka', quantity: 1, price: 280 }, { id: '23', order_id: '14', menu_item_id: '25', menu_item_name: 'Gulab Jamun', quantity: 25, price: 8 }], created_at: '2025-09-19T09:40:00Z' },
  { id: '15', order_number: 'ORD015', customer_id: '7', customer_name: 'Karan Mehta', total_amount: 1888, subtotal: 1600, gst_amount: 288, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'delivery', delivery_address: '147 CG Road, Ahmedabad', items: [{ id: '24', order_id: '15', menu_item_id: '2', menu_item_name: 'Chicken Biryani', quantity: 4, price: 350 }], created_at: '2025-09-18T17:15:00Z' },
  { id: '16', order_number: 'ORD016', customer_id: '4', customer_name: 'Sneha Gupta', total_amount: 767, subtotal: 650, gst_amount: 117, delivery_charges: 0, service_charges: 0, status: 'cancelled', order_type: 'pickup', delivery_address: '321 Brigade Road, Bangalore', items: [{ id: '25', order_id: '16', menu_item_id: '5', menu_item_name: 'Veg Biryani', quantity: 2, price: 250 }, { id: '26', order_id: '16', menu_item_id: '28', menu_item_name: 'Mango Lassi', quantity: 2, price: 80 }], created_at: '2025-09-17T14:30:00Z' },
  { id: '17', order_number: 'ORD017', customer_id: '2', customer_name: 'Priya Sharma', total_amount: 1062, subtotal: 900, gst_amount: 162, delivery_charges: 0, service_charges: 0, status: 'cancelled', order_type: 'delivery', delivery_address: '456 Park Street, Mumbai', items: [{ id: '27', order_id: '17', menu_item_id: '1', menu_item_name: 'Hyderabadi Mutton Biryani', quantity: 2, price: 450 }], created_at: '2025-09-16T11:20:00Z' },
  { id: '18', order_number: 'ORD018', customer_id: '8', customer_name: 'Neha Joshi', total_amount: 1416, subtotal: 1200, gst_amount: 216, delivery_charges: 0, service_charges: 0, status: 'cancelled', order_type: 'pickup', delivery_address: '258 Lal Darwaja, Jaipur', items: [{ id: '28', order_id: '18', menu_item_id: '3', menu_item_name: 'Hyderabadi Chicken Biryani', quantity: 2, price: 380 }, { id: '29', order_id: '18', menu_item_id: '12', menu_item_name: 'Dal Makhani', quantity: 1, price: 200 }, { id: '30', order_id: '18', menu_item_id: '25', menu_item_name: 'Gulab Jamun', quantity: 25, price: 8 }], created_at: '2025-09-15T16:45:00Z' },

  // Today's Orders (2025-10-01) - Various statuses and times
  { id: '19', order_number: 'ORD019', customer_id: '1', customer_name: 'Rajesh Kumar', total_amount: 1416, subtotal: 1200, gst_amount: 216, delivery_charges: 0, service_charges: 0, status: 'pending', order_type: 'delivery', delivery_address: '123 MG Road, Delhi', items: [{ id: '31', order_id: '19', menu_item_id: '1', menu_item_name: 'Hyderabadi Mutton Biryani', quantity: 2, price: 450 }, { id: '32', order_id: '19', menu_item_id: '12', menu_item_name: 'Dal Makhani', quantity: 1, price: 200 }, { id: '33', order_id: '19', menu_item_id: '25', menu_item_name: 'Gulab Jamun', quantity: 25, price: 8 }], created_at: '2025-10-01T08:30:00Z' },
  { id: '20', order_number: 'ORD020', customer_id: '2', customer_name: 'Priya Sharma', total_amount: 1003, subtotal: 850, gst_amount: 153, delivery_charges: 0, service_charges: 0, status: 'confirmed', order_type: 'pickup', delivery_address: '456 Park Street, Mumbai', items: [{ id: '34', order_id: '20', menu_item_id: '2', menu_item_name: 'Chicken Biryani', quantity: 2, price: 350 }, { id: '35', order_id: '20', menu_item_id: '18', menu_item_name: 'Butter Naan', quantity: 20, price: 25 }], created_at: '2025-10-01T09:15:00Z' },
  { id: '21', order_number: 'ORD021', customer_id: '3', customer_name: 'Amit Patel', total_amount: 1652, subtotal: 1400, gst_amount: 252, delivery_charges: 0, service_charges: 0, status: 'preparing', order_type: 'delivery', delivery_address: '789 FC Road, Pune', items: [{ id: '36', order_id: '21', menu_item_id: '3', menu_item_name: 'Hyderabadi Chicken Biryani', quantity: 2, price: 380 }, { id: '37', order_id: '21', menu_item_id: '9', menu_item_name: 'Butter Chicken', quantity: 1, price: 350 }, { id: '38', order_id: '21', menu_item_id: '25', menu_item_name: 'Gulab Jamun', quantity: 30, price: 8 }], created_at: '2025-10-01T10:00:00Z' },
  { id: '22', order_number: 'ORD022', customer_id: '5', customer_name: 'Vikram Singh', total_amount: 708, subtotal: 600, gst_amount: 108, delivery_charges: 0, service_charges: 0, status: 'out_for_delivery', order_type: 'delivery', delivery_address: '654 Anna Salai, Chennai', items: [{ id: '39', order_id: '22', menu_item_id: '23', menu_item_name: 'Paneer Tikka', quantity: 2, price: 280 }, { id: '40', order_id: '22', menu_item_id: '28', menu_item_name: 'Mango Lassi', quantity: 2, price: 80 }], created_at: '2025-10-01T11:30:00Z' },
  { id: '23', order_number: 'ORD023', customer_id: '6', customer_name: 'Ananya Reddy', total_amount: 1121, subtotal: 950, gst_amount: 171, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'pickup', delivery_address: '987 Jubilee Hills, Hyderabad', items: [{ id: '41', order_id: '23', menu_item_id: '9', menu_item_name: 'Butter Chicken', quantity: 2, price: 350 }, { id: '42', order_id: '23', menu_item_id: '18', menu_item_name: 'Butter Naan', quantity: 20, price: 25 }], created_at: '2025-10-01T12:45:00Z' },
  { id: '24', order_number: 'ORD024', customer_id: '7', customer_name: 'Karan Mehta', total_amount: 885, subtotal: 750, gst_amount: 135, delivery_charges: 0, service_charges: 0, status: 'pending', order_type: 'delivery', delivery_address: '147 CG Road, Ahmedabad', items: [{ id: '43', order_id: '24', menu_item_id: '4', menu_item_name: 'Mutton Biryani', quantity: 1, price: 420 }, { id: '44', order_id: '24', menu_item_id: '21', menu_item_name: 'Tandoori Chicken', quantity: 1, price: 380 }], created_at: '2025-10-01T14:20:00Z' },
  { id: '25', order_number: 'ORD025', customer_id: '10', customer_name: 'Pooja Kapoor', total_amount: 1298, subtotal: 1100, gst_amount: 198, delivery_charges: 0, service_charges: 0, status: 'confirmed', order_type: 'pickup', delivery_address: '741 Mall Road, Chandigarh', items: [{ id: '45', order_id: '25', menu_item_id: '1', menu_item_name: 'Hyderabadi Mutton Biryani', quantity: 2, price: 450 }, { id: '46', order_id: '25', menu_item_id: '12', menu_item_name: 'Dal Makhani', quantity: 1, price: 200 }], created_at: '2025-10-01T15:00:00Z' },
  { id: '26', order_number: 'ORD026', customer_id: '1', customer_name: 'Rajesh Kumar', total_amount: 566, subtotal: 480, gst_amount: 86, delivery_charges: 0, service_charges: 0, status: 'preparing', order_type: 'delivery', delivery_address: '123 MG Road, Delhi', items: [{ id: '47', order_id: '26', menu_item_id: '23', menu_item_name: 'Paneer Tikka', quantity: 1, price: 280 }, { id: '48', order_id: '26', menu_item_id: '28', menu_item_name: 'Mango Lassi', quantity: 2, price: 80 }], created_at: '2025-10-01T16:30:00Z' },
  { id: '27', order_number: 'ORD027', customer_id: '2', customer_name: 'Priya Sharma', total_amount: 378, subtotal: 320, gst_amount: 58, delivery_charges: 0, service_charges: 0, status: 'out_for_delivery', order_type: 'pickup', delivery_address: '456 Park Street, Mumbai', items: [{ id: '49', order_id: '27', menu_item_id: '5', menu_item_name: 'Veg Biryani', quantity: 1, price: 250 }, { id: '50', order_id: '27', menu_item_id: '28', menu_item_name: 'Mango Lassi', quantity: 1, price: 80 }], created_at: '2025-10-01T17:15:00Z' },
  { id: '28', order_number: 'ORD028', customer_id: '3', customer_name: 'Amit Patel', total_amount: 2124, subtotal: 1800, gst_amount: 324, delivery_charges: 0, service_charges: 0, status: 'delivered', order_type: 'delivery', delivery_address: '789 FC Road, Pune', items: [{ id: '51', order_id: '28', menu_item_id: '2', menu_item_name: 'Chicken Biryani', quantity: 4, price: 350 }, { id: '52', order_id: '28', menu_item_id: '18', menu_item_name: 'Butter Naan', quantity: 20, price: 25 }], created_at: '2025-10-01T18:00:00Z' },
  { id: '29', order_number: 'ORD029', customer_id: '5', customer_name: 'Vikram Singh', total_amount: 767, subtotal: 650, gst_amount: 117, delivery_charges: 0, service_charges: 0, status: 'pending', order_type: 'pickup', delivery_address: '654 Anna Salai, Chennai', items: [{ id: '53', order_id: '29', menu_item_id: '9', menu_item_name: 'Butter Chicken', quantity: 1, price: 350 }, { id: '54', order_id: '29', menu_item_id: '21', menu_item_name: 'Tandoori Chicken', quantity: 1, price: 380 }], created_at: '2025-10-01T19:30:00Z' },
  { id: '30', order_number: 'ORD030', customer_id: '6', customer_name: 'Ananya Reddy', total_amount: 496, subtotal: 420, gst_amount: 76, delivery_charges: 0, service_charges: 0, status: 'confirmed', order_type: 'delivery', delivery_address: '987 Jubilee Hills, Hyderabad', items: [{ id: '55', order_id: '30', menu_item_id: '4', menu_item_name: 'Mutton Biryani', quantity: 1, price: 420 }], created_at: '2025-10-01T20:45:00Z' },
];

export const mockOffers: Offer[] = [
  { id: '1', code: 'WELCOME50', discount_type: 'percentage', discount_value: 50, valid_from: '2025-01-01T00:00:00Z', valid_to: '2025-12-31T23:59:59Z', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: '2', code: 'FLAT100', discount_type: 'fixed', discount_value: 100, valid_from: '2025-09-01T00:00:00Z', valid_to: '2025-09-30T23:59:59Z', is_active: true, created_at: '2025-09-01T00:00:00Z' },
  { id: '3', code: 'SPECIAL20', discount_type: 'percentage', discount_value: 20, valid_from: '2025-09-15T00:00:00Z', valid_to: '2025-10-15T23:59:59Z', is_active: true, created_at: '2025-09-15T00:00:00Z' },
  { id: '4', code: 'FESTIVAL30', discount_type: 'percentage', discount_value: 30, valid_from: '2025-08-01T00:00:00Z', valid_to: '2025-08-31T23:59:59Z', is_active: false, created_at: '2025-08-01T00:00:00Z' },
  { id: '5', code: 'SAVE200', discount_type: 'fixed', discount_value: 200, valid_from: '2025-09-20T00:00:00Z', valid_to: '2025-10-20T23:59:59Z', is_active: true, created_at: '2025-09-20T00:00:00Z' },
];

export const mockCMSPages: CMSPage[] = [
  { id: '1', slug: 'about', title: 'About Us', content: '<h1>About SR FoodKraft</h1><p>We are passionate about delivering authentic Indian cuisine for your special occasions. Founded in 2020, SR FoodKraft has grown to become one of the most trusted catering services in the region, specializing in traditional biryanis, curries, and complete meal solutions for weddings, corporate events, and family gatherings.</p>', updated_at: '2025-09-01T00:00:00Z' },
  { id: '2', slug: 'terms', title: 'Terms & Conditions', content: '<h1>Terms & Conditions</h1><p>By using our catering services, you agree to these terms and conditions. Please read them carefully before placing your order.</p>', updated_at: '2025-09-01T00:00:00Z' },
  { id: '3', slug: 'privacy', title: 'Privacy Policy', content: '<h1>Privacy Policy</h1><p>We respect your privacy and are committed to protecting your personal data when you use our catering services.</p>', updated_at: '2025-09-01T00:00:00Z' },
  { id: '4', slug: 'contact', title: 'Contact Us', content: '<h1>Contact Us</h1><p>Email: contact@srfoodkraft.com<br>Phone: +91 1234567890<br>Address: 123 Main Street, New Delhi<br><br>For catering inquiries and bulk orders, please call us directly for personalized service.</p>', updated_at: '2025-09-01T00:00:00Z' },
];

export const mockPayments: Payment[] = [
  { id: '1', transaction_id: 'TXN001', order_id: '1', customer_id: '1', customer_name: 'Rajesh Kumar', amount: 750, payment_mode: 'upi', status: 'completed', created_at: '2025-09-28T10:05:00Z' },
  { id: '2', transaction_id: 'TXN002', order_id: '2', customer_id: '2', customer_name: 'Priya Sharma', amount: 400, payment_mode: 'upi', status: 'completed', created_at: '2025-09-29T12:35:00Z' },
  { id: '3', transaction_id: 'TXN003', order_id: '3', customer_id: '3', customer_name: 'Amit Patel', amount: 530, payment_mode: 'upi', status: 'completed', created_at: '2025-09-29T14:20:00Z' },
  { id: '4', transaction_id: 'TXN004', order_id: '4', customer_id: '5', customer_name: 'Vikram Singh', amount: 700, payment_mode: 'upi', status: 'pending', created_at: '2025-09-30T09:05:00Z' },
  { id: '5', transaction_id: 'TXN005', order_id: '5', customer_id: '6', customer_name: 'Ananya Reddy', amount: 280, payment_mode: 'cash', status: 'pending', created_at: '2025-09-30T11:50:00Z' },
  { id: '6', transaction_id: 'TXN006', order_id: '6', customer_id: '7', customer_name: 'Karan Mehta', amount: 180, payment_mode: 'upi', status: 'completed', created_at: '2025-09-27T15:35:00Z' },
  { id: '7', transaction_id: 'TXN007', order_id: '7', customer_id: '8', customer_name: 'Neha Joshi', amount: 230, payment_mode: 'upi', status: 'completed', created_at: '2025-09-26T08:25:00Z' },
  { id: '8', transaction_id: 'TXN008', order_id: '8', customer_id: '9', customer_name: 'Rahul Verma', amount: 640, payment_mode: 'cash', status: 'failed', created_at: '2025-09-25T13:15:00Z' },
  { id: '9', transaction_id: 'TXN009', order_id: '9', customer_id: '10', customer_name: 'Pooja Kapoor', amount: 400, payment_mode: 'cash', status: 'completed', created_at: '2025-09-24T16:55:00Z' },
  { id: '10', transaction_id: 'TXN010', order_id: '10', customer_id: '1', customer_name: 'Rajesh Kumar', amount: 600, payment_mode: 'upi', status: 'completed', created_at: '2025-09-23T12:05:00Z' },
];

export const mockInquiries: Inquiry[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 9876543210',
    subject: 'Bulk Order / Catering',
    message: 'Looking for traditional North Indian cuisine for wedding ceremony. Need vegetarian and non-vegetarian options. Budget around ₹2-3 lakhs.',
    event_type: 'wedding',
    guest_count: 200,
    status: 'Pending',
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9876543211',
    subject: 'Bulk Order / Catering',
    message: 'Corporate event for product launch. Need finger foods and beverages. Professional setup required.',
    event_type: 'corporate',
    guest_count: 50,
    status: 'Approved',
    internal_notes: 'Called customer, menu finalized',
    created_at: '2025-09-28T14:30:00Z',
    updated_at: '2025-09-30T09:15:00Z'
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 9876543212',
    subject: 'General Inquiry',
    message: 'Birthday party for 10-year-old. Need kid-friendly menu with some adult options.',
    event_type: 'birthday',
    guest_count: 30,
    status: 'Pending',
    created_at: '2025-09-25T16:45:00Z',
    updated_at: '2025-09-27T11:20:00Z'
  },
];
