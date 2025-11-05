import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getOrderById } from '../../services/storage';

const { width } = Dimensions.get('window');

export default function OrderTrackingScreen() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { orderId } = route.params || {};

  useEffect(() => {
    if (orderId && user) {
      loadOrder();
    }
  }, [orderId, user]);

  const loadOrder = async () => {
    try {
      if (user && orderId) {
        const orderData = await getOrderById(orderId, user.id);
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: 'checkmark-circle' },
      { key: 'preparing', label: 'Preparing', icon: 'time' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'bicycle' },
      { key: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle' },
    ];

    let currentIndex = -1;
    switch (status) {
      case 'pending':
        currentIndex = 0;
        break;
      case 'preparing':
        currentIndex = 1;
        break;
      case 'out_for_delivery':
        currentIndex = 2;
        break;
      case 'delivered':
        currentIndex = 3;
        break;
      default:
        currentIndex = 0;
    }

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
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
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </View>
    );
  }

  const statusSteps = getStatusSteps(order.status);
  const statusColor = getStatusColor(order.status);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIcon}>
              <Ionicons
                name="restaurant"
                size={32}
                color="#FF6B35"
              />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderItemName}>{order.item_name || 'Tiffin Meal'}</Text>
              <Text style={styles.orderId}>Order ID: #{order.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {statusSteps.map((step, index) => (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  {index > 0 && (
                    <View
                      style={[
                        styles.timelineLineTop,
                        step.completed && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.timelineDot,
                      step.completed && styles.timelineDotCompleted,
                      step.current && styles.timelineDotCurrent,
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={20}
                      color={step.completed ? '#FFFFFF' : '#CCC'}
                    />
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLineBottom,
                        step.completed && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineLabel}>
                  <Text
                    style={[
                      styles.timelineLabelText,
                      step.completed && styles.timelineLabelTextActive,
                      step.current && styles.timelineLabelTextCurrent,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date</Text>
            <Text style={styles.detailValue}>
              {new Date(order.order_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Time</Text>
            <Text style={styles.detailValue}>{order.delivery_time || '12:00 PM'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, styles.amountText]}>₹{order.total_amount}</Text>
          </View>
        </View>

        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>Delivery Address</Text>
          <View style={styles.addressContent}>
            <Ionicons name="location" size={20} color="#FF6B35" />
            <View style={styles.addressText}>
              <Text style={styles.addressLine}>{order.address_line}</Text>
              <Text style={styles.addressDetails}>
                {order.city} - {order.pincode}
              </Text>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  timelineLine: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineLineTop: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginBottom: 5,
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  timelineDotCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timelineDotCurrent: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  timelineLineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 5,
  },
  timelineLabel: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineLabelText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  timelineLabelTextActive: {
    color: '#4CAF50',
  },
  timelineLabelTextCurrent: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 18,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 30,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    marginLeft: 15,
  },
  addressLine: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  addressDetails: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});

