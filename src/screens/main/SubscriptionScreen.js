import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getSubscriptions, updateSubscription, deleteSubscription } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

export default function SubscriptionScreen() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('both');
  const [selectedTiming, setSelectedTiming] = useState('both');
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    loadSubscriptions();
  }, [user]);

  const loadSubscriptions = async () => {
    try {
      if (user) {
        const subscriptions = await getSubscriptions(user.id);
        setSubscriptions(subscriptions || []);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubscriptions();
  };

  const handlePause = async (id) => {
    try {
      await updateSubscription(id, user.id, { status: 'paused' });
      Alert.alert('Success', 'Subscription paused successfully');
      loadSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to pause subscription');
    }
  };

  const handleResume = async (id) => {
    try {
      await updateSubscription(id, user.id, { status: 'active' });
      Alert.alert('Success', 'Subscription resumed successfully');
      loadSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to resume subscription');
    }
  };

  const handleCancel = async (id) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateSubscription(id, user.id, { status: 'cancelled' });
              Alert.alert('Success', 'Subscription cancelled successfully');
              loadSubscriptions();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'paused':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'checkmark-circle';
      case 'paused':
        return 'pause-circle';
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
        <Text style={styles.headerTitle}>My Subscriptions</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            navigation.navigate('Address');
            Alert.alert('Info', 'Please add an address first to create subscription');
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription) => (
            <View key={subscription.id} style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionIcon}>
                  <Ionicons
                    name={getStatusIcon(subscription.status)}
                    size={24}
                    color={getStatusColor(subscription.status)}
                  />
                </View>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionPlan}>
                    {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan
                  </Text>
                  <Text style={styles.subscriptionDetails}>
                    {subscription.meal_type} • {subscription.timing}
                  </Text>
                  <Text style={styles.subscriptionAddress}>
                    {subscription.address_line}, {subscription.city}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(subscription.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.subscriptionDates}>
                <Text style={styles.dateLabel}>Start: {new Date(subscription.start_date).toLocaleDateString()}</Text>
                <Text style={styles.dateLabel}>End: {new Date(subscription.end_date).toLocaleDateString()}</Text>
              </View>

              <View style={styles.actionButtons}>
                {subscription.status === 'active' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.pauseButton]}
                    onPress={() => handlePause(subscription.id)}
                  >
                    <Ionicons name="pause" size={18} color="#FF9800" />
                    <Text style={[styles.actionButtonText, { color: '#FF9800' }]}>Pause</Text>
                  </TouchableOpacity>
                )}
                {subscription.status === 'paused' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resumeButton]}
                    onPress={() => handleResume(subscription.id)}
                  >
                    <Ionicons name="play" size={18} color="#4CAF50" />
                    <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Resume</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancel(subscription.id)}
                >
                  <Ionicons name="trash" size={18} color="#F44336" />
                  <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No subscriptions yet</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => {
                navigation.navigate('Address');
                Alert.alert('Info', 'Please add an address first');
              }}
            >
              <Text style={styles.createFirstButtonText}>Create Subscription</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subscriptionCard: {
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
  subscriptionHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  subscriptionIcon: {
    marginRight: 15,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subscriptionDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  subscriptionAddress: {
    fontSize: 13,
    color: '#999',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionDates: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  pauseButton: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  resumeButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  cancelButton: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
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
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

