import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERS: 'users',
  MENU: 'menu',
  SUBSCRIPTIONS: 'subscriptions',
  ORDERS: 'orders',
  ADDRESSES: 'addresses',
  PAYMENTS: 'payments',
};

// Users
export const getUsers = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const saveUser = async (user) => {
  try {
    const users = await getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id || u.email === user.email || u.phone === user.phone);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  } catch (error) {
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  const users = await getUsers();
  return users.find(u => u.email === email);
};

export const findUserByPhone = async (phone) => {
  const users = await getUsers();
  return users.find(u => u.phone === phone);
};

// Menu
export const getMenu = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MENU);
    if (data) return JSON.parse(data);
    
    // Initialize with sample menu if empty
    const sampleMenu = [
      {
        id: 1,
        item_name: 'Dal Rice',
        description: 'Homemade dal with steamed rice, pickle, and papad',
        meal_type: 'veg',
        timing: 'lunch',
        price: 80.00,
        available_date: new Date().toISOString().split('T')[0],
      },
      {
        id: 2,
        item_name: 'Chapati with Sabzi',
        description: 'Fresh rotis with seasonal vegetables',
        meal_type: 'veg',
        timing: 'lunch',
        price: 90.00,
        available_date: new Date().toISOString().split('T')[0],
      },
      {
        id: 3,
        item_name: 'Chicken Curry Rice',
        description: 'Spicy chicken curry with rice',
        meal_type: 'non_veg',
        timing: 'lunch',
        price: 120.00,
        available_date: new Date().toISOString().split('T')[0],
      },
      {
        id: 4,
        item_name: 'Veg Thali',
        description: 'Complete vegetarian meal with roti, dal, sabzi, rice, salad',
        meal_type: 'veg',
        timing: 'dinner',
        price: 100.00,
        available_date: new Date().toISOString().split('T')[0],
      },
      {
        id: 5,
        item_name: 'Chicken Thali',
        description: 'Complete non-veg meal with chicken curry, roti, rice, salad',
        meal_type: 'non_veg',
        timing: 'dinner',
        price: 150.00,
        available_date: new Date().toISOString().split('T')[0],
      },
    ];
    
    await AsyncStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(sampleMenu));
    return sampleMenu;
  } catch (error) {
    return [];
  }
};

// Subscriptions
export const getSubscriptions = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    const allSubscriptions = data ? JSON.parse(data) : [];
    return allSubscriptions.filter(s => s.user_id === userId);
  } catch (error) {
    return [];
  }
};

export const saveSubscription = async (subscription) => {
  try {
    const subscriptions = await getSubscriptions(subscription.user_id);
    subscription.id = Date.now();
    subscription.created_at = new Date().toISOString();
    
    const allData = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    const allSubscriptions = allData ? JSON.parse(allData) : [];
    allSubscriptions.push(subscription);
    
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(allSubscriptions));
    return subscription;
  } catch (error) {
    throw error;
  }
};

export const updateSubscription = async (subscriptionId, userId, updates) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    const subscriptions = data ? JSON.parse(data) : [];
    const index = subscriptions.findIndex(s => s.id === subscriptionId && s.user_id === userId);
    
    if (index >= 0) {
      subscriptions[index] = { ...subscriptions[index], ...updates, updated_at: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
      return subscriptions[index];
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const deleteSubscription = async (subscriptionId, userId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    const subscriptions = data ? JSON.parse(data) : [];
    const filtered = subscriptions.filter(s => !(s.id === subscriptionId && s.user_id === userId));
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    throw error;
  }
};

// Orders
export const getOrders = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    const allOrders = data ? JSON.parse(data) : [];
    return allOrders.filter(o => o.user_id === userId);
  } catch (error) {
    return [];
  }
};

export const getOrderById = async (orderId, userId) => {
  try {
    const orders = await getOrders(userId);
    return orders.find(o => o.id === orderId);
  } catch (error) {
    return null;
  }
};

export const saveOrder = async (order) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders = data ? JSON.parse(data) : [];
    order.id = Date.now();
    order.created_at = new Date().toISOString();
    orders.push(order);
    
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return order;
  } catch (error) {
    throw error;
  }
};

// Addresses
export const getAddresses = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
    const allAddresses = data ? JSON.parse(data) : [];
    return allAddresses.filter(a => a.user_id === userId);
  } catch (error) {
    return [];
  }
};

export const saveAddress = async (address) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
    const addresses = data ? JSON.parse(data) : [];
    
    if (address.is_default) {
      // Unset other defaults
      addresses.forEach(a => {
        if (a.user_id === address.user_id) a.is_default = false;
      });
    }
    
    address.id = Date.now();
    address.created_at = new Date().toISOString();
    addresses.push(address);
    
    await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
    return address;
  } catch (error) {
    throw error;
  }
};

export const updateAddress = async (addressId, userId, updates) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
    const addresses = data ? JSON.parse(data) : [];
    const index = addresses.findIndex(a => a.id === addressId && a.user_id === userId);
    
    if (index >= 0) {
      if (updates.is_default) {
        // Unset other defaults
        addresses.forEach(a => {
          if (a.user_id === userId && a.id !== addressId) a.is_default = false;
        });
      }
      
      addresses[index] = { ...addresses[index], ...updates, updated_at: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
      return addresses[index];
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const deleteAddress = async (addressId, userId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
    const addresses = data ? JSON.parse(data) : [];
    const filtered = addresses.filter(a => !(a.id === addressId && a.user_id === userId));
    await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    throw error;
  }
};

// Payments
export const getPayments = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
    const allPayments = data ? JSON.parse(data) : [];
    return allPayments.filter(p => p.user_id === userId);
  } catch (error) {
    return [];
  }
};

export const savePayment = async (payment) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
    const payments = data ? JSON.parse(data) : [];
    payment.id = Date.now();
    payment.transaction_id = `TXN${Date.now()}`;
    payment.created_at = new Date().toISOString();
    payments.push(payment);
    
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    return payment;
  } catch (error) {
    throw error;
  }
};

