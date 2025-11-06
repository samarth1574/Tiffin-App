import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getMenu } from '../../services/storage';

export default function MenuScreen() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all'); // all, veg, non_veg

  useEffect(() => {
    alert('Coming Soon');
  }, [selectedDate]); 
  
  useEffect(() => {
    loadMenu();
  }, [selectedDate]);
  

  const loadMenu = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const allMenu = await getMenu();
      const filteredMenu = allMenu.filter(item => item.available_date === dateStr);
      setMenu(filteredMenu);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMenu();
  };

  const filteredMenu = menu.filter((item) => {
    if (filter === 'veg') return item.meal_type === 'veg';
    if (filter === 'non_veg') return item.meal_type === 'non_veg';
    return true;
  });

  const getDateLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setLoading(true);
  };

  if (loading && menu.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Menu</Text>
      </LinearGradient>

      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
          <Ionicons name="chevron-back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{getDateLabel(selectedDate)}</Text>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'veg' && styles.filterButtonActive]}
          onPress={() => setFilter('veg')}
        >
          <Ionicons name="leaf" size={16} color={filter === 'veg' ? '#FFFFFF' : '#4CAF50'} />
          <Text style={[styles.filterText, filter === 'veg' && styles.filterTextActive]}>Veg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'non_veg' && styles.filterButtonActive]}
          onPress={() => setFilter('non_veg')}
        >
          <Ionicons name="restaurant" size={16} color={filter === 'non_veg' ? '#FFFFFF' : '#F44336'} />
          <Text style={[styles.filterText, filter === 'non_veg' && styles.filterTextActive]}>Non-Veg</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, item.meal_type === 'veg' ? styles.vegIcon : styles.nonVegIcon]}>
                  <Ionicons
                    name={item.meal_type === 'veg' ? 'leaf' : 'restaurant'}
                    size={24}
                    color={item.meal_type === 'veg' ? '#4CAF50' : '#F44336'}
                  />
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.item_name}</Text>
                  {item.description && (
                    <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
                  )}
                  <View style={styles.menuItemMeta}>
                    <View style={styles.timingBadge}>
                      <Ionicons name="time-outline" size={12} color="#666" />
                      <Text style={styles.timingText}>{item.timing}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemPrice}>₹{item.price}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No menu available</Text>
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
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButton: {
    padding: 5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 5,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  vegIcon: {
    backgroundColor: '#E8F5E9',
  },
  nonVegIcon: {
    backgroundColor: '#FFEBEE',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  menuItemMeta: {
    flexDirection: 'row',
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  menuItemRight: {
    alignItems: 'flex-end',
  },
  menuItemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

