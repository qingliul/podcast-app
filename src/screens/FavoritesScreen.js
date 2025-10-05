// src/screens/FavoritesScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { usePlayer } from '../context/PlayerContext';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const { 
    favorites, 
    loading, 
    removeFromFavorites,
    loadFavorites 
  } = useFavorites();
  const { playEpisode } = usePlayer();

  // 下拉刷新
  const onRefresh = () => {
    loadFavorites();
  };

  // 播放收藏的播客
  // 在 handlePlay 函数中，统一使用有效的音频URL
// 在 SubscriptionsScreen.js 和 FavoritesScreen.js 的 handlePlay 函数中
const handlePlay = (podcast) => {
  console.log('播放播客:', podcast.title);
  const episode = {
    id: podcast.id,
    title: podcast.title,
    host: podcast.host,
    image: podcast.image,
    // 确保使用MP3格式
    audioUrl: podcast.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 45 * 60,
  };
  playEpisode(episode);
};
  // 取消收藏
  const handleUnfavorite = (podcast) => {
    removeFromFavorites(podcast.id);
  };

  // 格式化收藏时间
  const formatFavoriteTime = (timeString) => {
    if (!timeString) return '最近';
    
    const date = new Date(timeString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}月前`;
  };

  // 空状态组件
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        还没有收藏任何播客
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        去发现页面收藏你喜欢的播客吧
      </Text>
    </View>
  );

  // 收藏项组件
  const FavoriteItem = ({ podcast }) => (
    <View style={[styles.favoriteItem, { backgroundColor: colors.card }]}>
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        {podcast.image ? (
          <Image 
            source={{ uri: podcast.image }} 
            style={styles.podcastImage}
          />
        ) : (
          <Ionicons name="musical-notes" size={24} color={colors.textSecondary} />
        )}
      </View>
      
      <View style={styles.podcastInfo}>
        <Text style={[styles.podcastTitle, { color: colors.text }]} numberOfLines={1}>
          {podcast.title}
        </Text>
        <Text style={[styles.podcastHost, { color: colors.textSecondary }]} numberOfLines={1}>
          {podcast.host}
        </Text>
        <Text style={[styles.favoriteTime, { color: colors.textSecondary }]}>
          收藏于 {formatFavoriteTime(podcast.favoritedAt)}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => handlePlay(podcast)}
        >
          <Ionicons name="play-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.unfavoriteButton}
          onPress={() => handleUnfavorite(podcast)}
        >
          <Ionicons name="star" size={20} color="#FFD700" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>我的收藏</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            共 {favorites.length} 个播客
          </Text>
        </View>

        {favorites.length > 0 ? (
          favorites.map((podcast) => (
            <FavoriteItem key={podcast.id} podcast={podcast} />
          ))
        ) : (
          <EmptyState />
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  podcastImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  podcastInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  podcastHost: {
    fontSize: 14,
    marginBottom: 4,
  },
  favoriteTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    padding: 4,
  },
  unfavoriteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});