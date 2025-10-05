// src/screens/SubscriptionsScreen.js
import React, { useEffect, useState } from 'react';
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
import { useSubscription } from '../context/SubscriptionContext';
import { usePlayer } from '../context/PlayerContext';

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const { 
    subscriptions, 
    loading, 
    unsubscribeFromPodcast,
    loadSubscriptions
  } = useSubscription();
  const { playEpisode } = usePlayer();

  // 添加详细的调试日志
  useEffect(() => {
    console.log('📱 订阅页面加载 - 订阅数量:', subscriptions.length);
    console.log('📱 订阅页面 - 订阅数据:', subscriptions);
  }, []);

  // 监听订阅数据变化
  useEffect(() => {
    console.log('🔄 订阅数据变化 - 数量:', subscriptions.length, '数据:', subscriptions);
  }, [subscriptions]);

  // 下拉刷新
  const onRefresh = () => {
    console.log('🔄 手动刷新订阅数据');
    loadSubscriptions();
  };

  // 播放订阅的播客
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

  // 取消订阅
  const handleUnsubscribe = (podcast) => {
    console.log('取消订阅:', podcast.title);
    unsubscribeFromPodcast(podcast.id);
  };

  // 格式化订阅时间
  const formatSubscribeTime = (timeString) => {
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
      <Ionicons name="library-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        还没有订阅任何播客
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        去发现页面找到你喜欢的播客吧
      </Text>
    </View>
  );

  // 订阅项组件
  const SubscriptionItem = ({ podcast }) => (
    <View style={[styles.subscriptionItem, { backgroundColor: colors.card }]}>
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
        <Text style={[styles.subscribeTime, { color: colors.textSecondary }]}>
          订阅于 {formatSubscribeTime(podcast.subscribedAt)}
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
          style={styles.unsubscribeButton}
          onPress={() => handleUnsubscribe(podcast)}
        >
          <Ionicons name="heart-dislike" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  console.log('🎨 订阅页面渲染 - 订阅数量:', subscriptions.length);

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
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>我的订阅</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                共 {subscriptions.length} 个播客
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onRefresh}
              style={[styles.refreshButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {subscriptions.length > 0 ? (
          subscriptions.map((podcast) => (
            <SubscriptionItem key={podcast.id} podcast={podcast} />
          ))
        ) : (
          <EmptyState />
        )}
        
        {/* 实时调试信息 */}
        <View style={styles.debugInfo}>
          <Text style={[styles.debugText, { color: colors.textSecondary }]}>
            实时调试: 订阅数量 = {subscriptions.length}
          </Text>
          <Text style={[styles.debugText, { color: colors.textSecondary }]}>
            最后更新: {new Date().toLocaleTimeString()}
          </Text>
        </View>
        
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  subscriptionItem: {
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
  subscribeTime: {
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
  unsubscribeButton: {
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
    marginBottom: 20,
  },
  debugInfo: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    margin: 16,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  bottomSpacer: {
    height: 20,
  },
});