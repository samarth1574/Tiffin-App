import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/storage';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

    useEffect(() => {
        alert('Coming Soon');
      }, []); 
      
  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      if (user) {
        const userOrders = await getOrders(user.id);
        setOrders(userOrders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'out_for_delivery':
        return '#2196F3';
      case 'preparing':
        return '#FF9800';
      case 'pending':
        return '#999';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return 'checkmark-circle';
      case 'out_for_delivery':
        return 'bicycle';
      case 'preparing':
        return 'time';
      case 'pending':
        return 'hourglass';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Orders</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length > 0 ? (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderIcon}>
                  <Ionicons
                    name={getStatusIcon(order.status)}
                    size={24}
                    color={getStatusColor(order.status)}
                  />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderItemName}>{order.item_name || 'Tiffin Meal'}</Text>
                  <Text style={styles.orderAddress}>
                    {order.address_line}, {order.city}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.order_date).toLocaleDateString()} • {order.delivery_time || '12:00 PM'}
                  </Text>
                </View>
                <View style={styles.orderAmount}>
                  <Text style={styles.amountText}>₹{order.total_amount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              {order.status === 'out_for_delivery' && (
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
                >
                  <Ionicons name="location" size={16} color="#2196F3" />
                  <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your order history will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
  },
  orderIcon: {
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  trackButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 5,
  },
});

