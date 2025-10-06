// src/screens/DiscoveryScreen.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  Modal,
  Alert,
  Platform // 添加 Platform 导入
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useSubscription } from '../context/SubscriptionContext'; 
import { useFavorites } from '../context/FavoritesContext';
import { useComments } from '../context/CommentsContext';
const { width, height } = Dimensions.get('window');

// 模拟播客数据
const mockPodcasts = [
  {
    id: '1',
    title: '科技早知道',
    host: '科技频道',
    category: '科技',
    duration: '45分钟',
    listeners: '12.5万',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '最新科技动态和趋势分析，带你了解前沿科技发展',
    isFeatured: true,
    rating: 4.8
  },
  {
    id: '2',
    title: '深夜读书会',
    host: '文学电台',
    category: '文化',
    duration: '30分钟',
    listeners: '8.3万',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '经典文学作品解读和分享，感受文字的魅力',
    isFeatured: true,
    rating: 4.6
  },
  {
    id: '3',
    title: '商业思维',
    host: '商业洞察',
    category: '商业',
    duration: '50分钟',
    listeners: '15.2万',
    image: 'https://images.unsplash.com/photo-1664575198263-269a022d6f14?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '商业案例分析和思维训练，提升商业认知',
    isFeatured: true,
    rating: 4.9
  },
  {
    id: '4',
    title: '心理健康指南',
    host: '心理专家',
    category: '健康',
    duration: '25分钟',
    listeners: '6.7万',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '心理健康知识和自我调节方法，关注内心成长',
    rating: 4.5
  },
  {
    id: '5',
    title: '历史那些事',
    host: '历史研究会',
    category: '历史',
    duration: '40分钟',
    listeners: '9.8万',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '历史事件和人物故事，以史为鉴知兴替',
    rating: 4.7
  },
  {
    id: '6',
    title: '音乐故事',
    host: '音乐电台',
    category: '音乐',
    duration: '35分钟',
    listeners: '11.4万',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '音乐背后的故事和创作历程，感受音乐的力量',
    rating: 4.8
  },
  {
    id: '7',
    title: '人工智能前沿',
    host: 'AI实验室',
    category: '科技',
    duration: '55分钟',
    listeners: '18.9万',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '人工智能最新发展和应用，探索AI未来',
    rating: 4.9
  },
  {
    id: '8',
    title: '投资理财入门',
    host: '财经学院',
    category: '商业',
    duration: '38分钟',
    listeners: '22.3万',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '基础投资理财知识和技巧，实现财富增值',
    rating: 4.6
  },
  {
    id: '9',
    title: '英语学习指南',
    host: '语言大师',
    category: '教育',
    duration: '28分钟',
    listeners: '14.2万',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '实用英语学习方法和技巧，提升语言能力',
    rating: 4.7
  },
  {
    id: '10',
    title: '健身与营养',
    host: '健康生活',
    category: '健康',
    duration: '32分钟',
    listeners: '7.8万',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '科学健身方法和营养搭配，打造健康体魄',
    rating: 4.5
  }
];

// 分类数据
const categories = [
  { id: 'all', name: '全部', icon: 'grid' },
  { id: 'tech', name: '科技', icon: 'hardware-chip' },
  { id: 'business', name: '商业', icon: 'trending-up' },
  { id: 'culture', name: '文化', icon: 'book' },
  { id: 'health', name: '健康', icon: 'fitness' },
  { id: 'history', name: '历史', icon: 'time' },
  { id: 'music', name: '音乐', icon: 'musical-notes' },
  { id: 'education', name: '教育', icon: 'school' }
];

// 搜索历史最大数量
const MAX_SEARCH_HISTORY = 8;

export default function DiscoveryScreen({ navigation }) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchHistory, setSearchHistory] = useState(['科技', '商业', '健康']);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('featured'); // 'featured', 'categories', 'trending'
  const { getCommentCount } = useComments();
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);
  
  const { playEpisode, addToPlaylist } = usePlayer();
  const { subscribeToPodcast, unsubscribeFromPodcast, isSubscribed } = useSubscription(); 
  const { toggleFavorite, isFavorited } = useFavorites();

  // Web 平台特定的修复
  const isWeb = Platform.OS === 'web';
  // 动画值
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40, 80],
    outputRange: [0, 0.6, 0.6],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  // 精选播客
  const featuredPodcasts = useMemo(() => 
    mockPodcasts.filter(podcast => podcast.isFeatured), []
  );

  // 热门播客
  const trendingPodcasts = useMemo(() => 
    [...mockPodcasts]
      .sort((a, b) => parseFloat(b.listeners) - parseFloat(a.listeners))
      .slice(0, 6), []
  );

  // 过滤后的播客列表
  const filteredPodcasts = useMemo(() => {
    let results = mockPodcasts;
    
    // 分类筛选
    if (selectedCategory !== 'all') {
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
      results = results.filter(podcast => podcast.category === categoryName);
    }
    
    // 搜索筛选
    if (searchText.trim()) {
      const searchTerm = searchText.toLowerCase().trim();
      results = results.filter(podcast =>
        podcast.title.toLowerCase().includes(searchTerm) ||
        podcast.host.toLowerCase().includes(searchTerm) ||
        podcast.category.toLowerCase().includes(searchTerm) ||
        podcast.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return results;
  }, [searchText, selectedCategory]);

  // 搜索结果数量
  const searchResultsCount = filteredPodcasts.length;

  // 添加到搜索历史
  const addToSearchHistory = (term) => {
    if (!term.trim()) return;
    
    const termLower = term.toLowerCase().trim();
    const updatedHistory = searchHistory.filter(item => 
      item.toLowerCase() !== termLower
    );
    
    const newHistory = [term, ...updatedHistory].slice(0, MAX_SEARCH_HISTORY);
    setSearchHistory(newHistory);
  };

  // 搜索处理
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // 执行搜索
  const performSearch = () => {
    if (searchText.trim()) {
      addToSearchHistory(searchText);
      setShowSearchResults(true);
      setShowSearchHistory(false);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchText('');
    setShowSearchResults(false);
    setShowSearchHistory(false);
  };

  // 从历史记录搜索
  const searchFromHistory = (term) => {
    setSearchText(term);
    addToSearchHistory(term);
    setShowSearchResults(true);
    setShowSearchHistory(false);
    searchInputRef.current?.blur();
  };

  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  // 分类筛选
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowSearchResults(false);
  };

  // 处理订阅/取消订阅
  const handleSubscribe = (podcast) => {
    if (isSubscribed(podcast.id)) {
      unsubscribeFromPodcast(podcast.id);
    } else {
      subscribeToPodcast(podcast);
    }
  };

  // 处理收藏/取消收藏
  const handleFavorite = (podcast) => {
    toggleFavorite(podcast);
  };
  // 修复：Web 平台搜索框点击处理
   const handleSearchContainerPress = () => {
    if (isWeb) {
      // 强制聚焦到输入框
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  };

  // 修复：Web 平台输入框焦点处理
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSearchHistory(true);
    // Web 平台特定：确保键盘不会影响布局
    if (isWeb) {
      setTimeout(() => {
        // 在 Web 上，滚动到搜索框位置
        searchInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
          if (pageY < 100) {
            // 如果搜索框在视图顶部，轻微滚动
            scrollY.setValue(Math.max(0, scrollY._value - 50));
          }
        });
      }, 100);
    }
  };

  // 修复：Web 平台输入框失去焦点处理
  const handleSearchBlur = () => {
    // 在 Web 上增加延迟，确保点击事件能正常处理
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSearchHistory(false);
    }, isWeb ? 300 : 200);
  };

  // 修复：Web 平台清除搜索
  const handleClearSearch = (e) => {
    if (isWeb && e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSearchText('');
    setShowSearchResults(false);
    setShowSearchHistory(false);
  };

  // 修复：Web 平台麦克风按钮点击
  const handleMicPress = (e) => {
    if (isWeb && e) {
      e.stopPropagation();
      e.preventDefault();
    }
    searchInputRef.current?.focus();
  };

  // 修复：Web 平台搜索历史项点击
  const handleSearchFromHistory = (term, e) => {
    if (isWeb && e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSearchText(term);
    addToSearchHistory(term);
    setShowSearchResults(true);
    setShowSearchHistory(false);
    searchInputRef.current?.blur();
  };
  // 添加到播放列表
  const handleAddToPlaylist = (podcast) => {
    addToPlaylist(podcast);
    Alert.alert('成功', `"${podcast.title}" 已添加到播放列表`);
  };

  // 播放处理函数
  const handlePlay = (podcast) => {
    const episode = {
      id: podcast.id,
      title: podcast.title,
      host: podcast.host,
      image: podcast.image,
      audioUrl: podcast.audioUrl,
      duration: 45 * 60,
    };
    playEpisode(episode);
  };

  // 下拉刷新
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // 渲染推荐播客卡片
  const renderFeaturedPodcast = ({ item, index }) => {
    const translateX = scrollY.interpolate({
      inputRange: [-1, 0, 200 * index, 200 * (index + 2)],
      outputRange: [0, 0, 0, -50],
    });

    return (
      <Animated.View style={{ transform: [{ translateX }] }}>
        <TouchableOpacity 
          style={[styles.featuredCard, { backgroundColor: colors.card }]}
          onPress={() => handlePlay(item)}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: item.image }} 
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredBadge}>
              <Ionicons name="flash" size={12} color="#FFFFFF" />
              <Text style={styles.featuredBadgeText}>精选</Text>
            </View>
            <View style={styles.featuredContent}>
              <Text style={[styles.featuredTitle, { color: '#FFFFFF' }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.featuredHost, { color: 'rgba(255,255,255,0.8)' }]}>
                {item.host}
              </Text>
              <View style={styles.featuredStats}>
                <View style={styles.statItem}>
                  <Ionicons name="headset" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.featuredStatText}>{item.listeners}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.featuredStatText}>{item.rating}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 渲染播客项
  const renderPodcastItem = ({ item, index }) => {
    const subscribed = isSubscribed(item.id);
    const favorited = isFavorited(item.id);

    return (
      <View>
        <TouchableOpacity 
          style={[styles.podcastItem, { backgroundColor: colors.card }]}
          onPress={() => handlePlay(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.podcastImage}
              resizeMode="cover"
            />
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>
          
          <View style={styles.podcastInfo}>
            <Text style={[styles.podcastTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.podcastHost, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.host}
            </Text>
            <Text style={[styles.podcastDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.podcastMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="headset" size={12} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {item.listeners}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {item.rating}
                </Text>
              </View>
              <View style={[styles.categoryTag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleFavorite(item)}
            >
              <Ionicons 
                name={favorited ? "star" : "star-outline"} 
                size={20} 
                color={favorited ? "#FFD700" : colors.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Comments', { 
                episodeId: item.id, 
                episodeTitle: item.title 
              })}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.commentCount, { color: colors.textSecondary }]}>
                {getCommentCount(item.id)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSubscribe(item)}
            >
              <Ionicons 
                name={subscribed ? "heart" : "heart-outline"} 
                size={20} 
                color={subscribed ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAddToPlaylist(item)}
            >
              <Ionicons name="add" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={() => handlePlay(item)}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染搜索历史项
  const renderSearchHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.searchHistoryItem, { borderBottomColor: colors.border }]}
      onPress={() => searchFromHistory(item)}
      activeOpacity={0.6}
    >
      <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
      <Text style={[styles.searchHistoryText, { color: colors.text }]} numberOfLines={1}>
        {item}
      </Text>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          const newHistory = searchHistory.filter(history => history !== item);
          setSearchHistory(newHistory);
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // 渲染分类项
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { 
          backgroundColor: selectedCategory === item.id ? colors.primary : colors.card,
          borderColor: selectedCategory === item.id ? colors.primary : colors.border
        }
      ]}
      onPress={() => handleCategorySelect(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon} 
        size={18} 
        color={selectedCategory === item.id ? '#FFFFFF' : colors.text} 
      />
      <Text 
        style={[
          styles.categoryText,
          { color: selectedCategory === item.id ? '#FFFFFF' : colors.text }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // 渲染热门播客项
  const renderTrendingPodcast = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.trendingItem, { backgroundColor: colors.card }]}
      onPress={() => handlePlay(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.trendingRank, { color: colors.primary }]}>
        #{index + 1}
      </Text>
      <Image 
        source={{ uri: item.image }} 
        style={styles.trendingImage}
        resizeMode="cover"
      />
      <View style={styles.trendingInfo}>
        <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.trendingHost, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.host}
        </Text>
        <View style={styles.trendingStats}>
          <Ionicons name="headset" size={10} color={colors.textSecondary} />
          <Text style={[styles.trendingStatText, { color: colors.textSecondary }]}>
            {item.listeners}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* 动态头部 */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          { 
            backgroundColor: colors.card,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <Text style={[styles.animatedHeaderTitle, { color: colors.text }]}>
          发现
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.card}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchSection}>
        {/* 添加 TouchableOpacity 包装搜索容器 */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={handleSearchContainerPress}
          style={styles.searchTouchable}
        >
          <View style={[styles.searchContainer, { 
            backgroundColor: colors.card,
            borderRadius: borderRadius.lg 
          }]}
          onClick={isWeb ? handleSearchContainerPress : undefined}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, {
                color: colors.text,
                marginLeft: spacing.sm,
                marginRight: spacing.sm,
              }]}
              placeholder="搜索播客名称、主播、分类..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={handleSearch}
              onSubmitEditing={performSearch}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              returnKeyType="search"
              // Web 特定属性
              pointerEvents="box-only"
            />
            {searchText ? (
              <TouchableOpacity 
                onPress={handleClearSearch} 
                hitSlop={10}
                style={styles.searchIconButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleMicPress} 
                hitSlop={10}
                style={styles.searchIconButton}
              >
                <Ionicons name="mic-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* 搜索历史部分也需要修复 */}
        {showSearchHistory && searchHistory.length > 0 && (
          <View style={[styles.searchHistory, { backgroundColor: colors.card }]}>
            <View style={styles.searchHistoryHeader}>
              <Text style={[styles.searchHistoryTitle, { color: colors.text }]}>
                搜索历史
              </Text>
              <TouchableOpacity 
                onPress={clearSearchHistory}
                style={styles.clearHistoryButton}
              >
                <Text style={[styles.clearHistoryText, { color: colors.textSecondary }]}>
                  清空
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchHistory}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.searchHistoryItem, { borderBottomColor: colors.border }]}
                  onPress={(e) => handleSearchFromHistory(item, e)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.searchHistoryText, { color: colors.text }]} numberOfLines={1}>
                    {item}
                  </Text>
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      const newHistory = searchHistory.filter(history => history !== item);
                      setSearchHistory(newHistory);
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.removeHistoryButton}
                  >
                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>

        {/* 标签页切换 */}
        {!showSearchResults && (
          <View style={styles.tabSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tabContainer}>
                {[
                  { id: 'featured', label: '精选推荐', icon: 'star' },
                  { id: 'trending', label: '热门榜单', icon: 'trending-up' },
                  { id: 'categories', label: '分类浏览', icon: 'grid' },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.tabButton,
                      { 
                        backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                        marginRight: spacing.sm
                      }
                    ]}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <Ionicons 
                      name={tab.icon} 
                      size={16} 
                      color={activeTab === tab.id ? '#FFFFFF' : colors.text} 
                    />
                    <Text style={[
                      styles.tabText,
                      { color: activeTab === tab.id ? '#FFFFFF' : colors.text }
                    ]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 内容区域 */}
        {showSearchResults ? (
          // 搜索结果
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[typography.subtitle, { color: colors.text }]}>
                  搜索结果
                </Text>
                <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                  找到 {searchResultsCount} 个相关节目
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: colors.card }]}
                onPress={clearSearch}
              >
                <Ionicons name="arrow-back" size={16} color={colors.text} />
                <Text style={[styles.backButtonText, { color: colors.text }]}>
                  返回
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredPodcasts}
              renderItem={renderPodcastItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.podcastsList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    没有找到相关节目
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                    尝试其他关键词或分类
                  </Text>
                </View>
              }
            />
          </View>
        ) : (
          // 正常内容
          <View style={styles.contentSection}>
            {/* 精选推荐 */}
            {activeTab === 'featured' && (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[typography.subtitle, { color: colors.text }]}>
                    精选推荐
                  </Text>
                  <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>
                      全部
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={featuredPodcasts}
                  renderItem={renderFeaturedPodcast}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                  snapToInterval={width * 0.8 + spacing.md}
                  decelerationRate="fast"
                  pagingEnabled
                />
              </View>
            )}

            {/* 热门榜单 */}
            {activeTab === 'trending' && (
              <View style={styles.trendingSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[typography.subtitle, { color: colors.text }]}>
                    热门榜单
                  </Text>
                  <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>
                      更多
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={trendingPodcasts}
                  renderItem={renderTrendingPodcast}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.trendingList}
                />
              </View>
            )}

            {/* 分类浏览 */}
            {activeTab === 'categories' && (
              <View style={styles.categoriesSection}>
                <Text style={[typography.subtitle, { 
                  color: colors.text,
                  marginBottom: spacing.md 
                }]}>
                  分类浏览
                </Text>
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                />
              </View>
            )}

            {/* 推荐播客列表 */}
            <View style={styles.podcastsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[typography.subtitle, { color: colors.text }]}>
                  {activeTab === 'featured' ? '热门播客' : 
                   activeTab === 'trending' ? '更多推荐' : '全部播客'}
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    查看全部
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={filteredPodcasts.slice(0, activeTab === 'trending' ? 4 : 6)}
                renderItem={renderPodcastItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.podcastsList}
              />
            </View>
          </View>
        )}

        {/* 底部安全区域 */}
        <View style={{ height: 30 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: StatusBar.currentHeight + 80,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 999,
    paddingTop: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  animatedHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  searchSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchHistory: {
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearHistoryText: {
    fontSize: 12,
  },
  searchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchHistoryText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: 14,
  },
  tabSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  featuredSection: {
    marginBottom: 32,
  },
  featuredList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  featuredCard: {
    width: width * 0.8,
    height: 200,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,107,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredContent: {
    marginTop: 'auto',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  featuredHost: {
    fontSize: 14,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  featuredStatText: {
    fontSize: 12,
    marginLeft: 4,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  trendingSection: {
    marginBottom: 32,
  },
  trendingList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingRank: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 30,
  },
  trendingImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendingHost: {
    fontSize: 14,
    marginBottom: 6,
  },
  trendingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  categoriesSection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  podcastsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  podcastsList: {
    gap: 16,
    paddingHorizontal: 16,
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  podcastImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  podcastInfo: {
    flex: 1,
    marginRight: 12,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  podcastHost: {
    fontSize: 14,
    marginBottom: 6,
  },
  podcastDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    marginLeft: 4,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionButtons: {
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  commentCount: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsSection: {
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 20,
  },
searchTouchable: {
    // 确保触摸区域正确
  },
  searchIconButton: {
    // 确保图标按钮有合适的点击区域
    padding: 4,
  },
  clearHistoryButton: {
    padding: 4,
  },
  removeHistoryButton: {
    padding: 2,
  },
});