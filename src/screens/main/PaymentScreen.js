import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { savePayment } from '../../services/storage';

export default function PaymentScreen() {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { subscriptionId, amount } = route.params || {};

  const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: 'phone-portrait', color: '#4CAF50' },
    { id: 'card', label: 'Credit/Debit Card', icon: 'card', color: '#2196F3' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet', color: '#FF9800' },
    { id: 'netbanking', label: 'Net Banking', icon: 'business', color: '#9C27B0' },
  ];

  const handlePayment = async () => {
    if (!subscriptionId || !amount) {
      Alert.alert('Error', 'Missing payment information');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setProcessing(true);
    try {
      const payment = await savePayment({
        user_id: user.id,
        subscription_id: subscriptionId,
        amount: amount,
        payment_method: selectedMethod,
        status: 'completed',
      });

      Alert.alert(
        'Payment Successful',
        `Transaction ID: ${payment.transaction_id || 'N/A'}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'Please try again');
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>₹{amount || 0}</Text>
        </View>

        <View style={styles.methodsCard}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodOption,
                selectedMethod === method.id && styles.methodOptionSelected,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
                <Ionicons name={method.icon} size={24} color={method.color} />
              </View>
              <Text style={styles.methodLabel}>{method.label}</Text>
              <View style={styles.radioButton}>
                {selectedMethod === method.id && (
                  <View style={[styles.radioButtonInner, { backgroundColor: method.color }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMethod === 'upi' && (
          <View style={styles.upiCard}>
            <Text style={styles.upiTitle}>Enter UPI ID</Text>
            <View style={styles.upiInput}>
              <Text style={styles.upiPlaceholder}>yourname@paytm</Text>
            </View>
            <Text style={styles.upiNote}>Note: This is a demo payment</Text>
          </View>
        )}

        {selectedMethod === 'card' && (
          <View style={styles.cardInfo}>
            <Text style={styles.cardNote}>
              Card payment gateway integration coming soon
            </Text>
          </View>
        )}

        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityDescription}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay ₹{amount || 0}</Text>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" style={{ marginLeft: 10 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  amountCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 10,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  methodsCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
  },
  methodOptionSelected: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  upiCard: {
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
  upiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  upiInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
  },
  upiPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  upiNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  cardInfo: {
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
  cardNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  securityText: {
    flex: 1,
    marginLeft: 15,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  securityDescription: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  payButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

