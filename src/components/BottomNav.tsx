// src/components/BottomNav.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Users, User } from 'react-native-feather'; // ✅ Users for Groups
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  activeTab: 'home' | 'group' | 'profile';
  onTabChange: (tab: 'home' | 'group' | 'profile') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* HOME TAB */}
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'home' && styles.activeTab]}
        onPress={() => onTabChange('home')}
      >
        <Home 
          width={24} 
          height={24} 
          color={activeTab === 'home' ? '#0078D4' : '#6b7280'} 
          strokeWidth={2.5}
        />
        <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* GROUPS TAB - YOUR CODE (PERFECT!) */}
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'group' && styles.activeTab]}
        onPress={() => onTabChange('group')}
      >
        <Users 
          width={24} 
          height={24} 
          color={activeTab === 'group' ? '#0078D4' : '#6b7280'} 
          strokeWidth={2.5}
        />
        <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>
          People
        </Text>
      </TouchableOpacity>

      {/* PROFILE TAB */}
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
        onPress={() => onTabChange('profile')}
      >
        <User 
          width={24} 
          height={24} 
          color={activeTab === 'profile' ? '#0078D4' : '#6b7280'} 
          strokeWidth={2.5}
        />
        <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  activeTab: {
    // Active tab styling
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0078D4',
    fontWeight: '600',
  },
});

export default BottomNav;
