// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { useAuth } from '../context/AuthContext';
import { getSharePointNews, NewsItem } from '../services/news.service';

const HomeScreen = () => {
  const { user, accessToken } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const newsData = await getSharePointNews(accessToken);
      setNews(newsData);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNews();
  }, [accessToken]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

const openNewsInBrowser = async (item: NewsItem) => {
  if (!item.webUrl) {
    Alert.alert('Error', 'No URL available for this news item');
    return;
  }

  try {
    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.open(item.webUrl, {
        // iOS Options - Minimal UI
        dismissButtonStyle: 'close',
        preferredBarTintColor: '#ffffff', // White/transparent
        preferredControlTintColor: '#0078d4',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: true, // ✅ Hide toolbar on scroll
        
        // Android Options - Hide Everything
        showTitle: false, // ✅ No title
        toolbarColor: '#ffffff', // White (invisible)
        secondaryToolbarColor: '#ffffff',
        navigationBarColor: '#ffffff',
        navigationBarDividerColor: '#ffffff',
        enableUrlBarHiding: true, // ✅ Hide URL bar
        enableDefaultShare: false, // ✅ No share button
        forceCloseOnRedirection: false,
        
        // Headers for SSO (no login popup)
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        
        // Smooth animations
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
      });
    }
  } catch (error) {
    console.error('Failed to open browser:', error);
    Alert.alert('Error', 'Failed to open the news article');
  }
};

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>News Posts</Text>
        <Text style={styles.headerSubtitle}>
          {news.length} {news.length === 1 ? 'article' : 'articles'} available
        </Text>
      </View>
      {news.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{news.filter(n => n.category === 'Featured').length}</Text>
            <Text style={styles.statLabel}>Featured</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{news.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => openNewsInBrowser(item)}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.newsContent}>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.category}>{item.category}</Text>
          </View>
        )}
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.newsDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.date}>{formatDate(item.publishedDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0078d4" />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) =>
          item.id
            ? `${item.id}-${item.webUrl ?? index}`
            : index.toString()
        }
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#0078d4']}
            tintColor="#0078d4"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No news available</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  
  // Header Styles
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 15,
  },
  headerContent: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0078d4',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0078d4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#d1d5db',
  },
  
  // News Card Styles
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  newsContent: {
    padding: 15,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0078d4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  author: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
  },
});

export default HomeScreen;