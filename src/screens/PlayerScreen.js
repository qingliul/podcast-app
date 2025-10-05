// src/screens/PlayerScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  Animated
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useFavorites } from '../context/FavoritesContext';
import { useComments } from '../context/CommentsContext'; // 添加这行

const { width, height } = Dimensions.get('window');

export default function PlayerScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { 
    currentEpisode, 
    isPlaying, 
    playbackPosition, 
    playbackDuration,
    playbackRate,
    togglePlayback,
    seekTo,
    setPlaybackRate,
    nextEpisode,
    previousEpisode,
    isBuffering,
    playlist,
    currentIndex,
    togglePlaylistVisible
  } = usePlayer();
  
  const { isSubscribed, subscribeToPodcast, unsubscribeFromPodcast } = useSubscription();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { getCommentCount } = useComments(); // 添加这行

  const [showPlaybackRates, setShowPlaybackRates] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!isSeeking && playbackDuration > 0) {
      setProgress(playbackPosition);
    }
  }, [playbackPosition, playbackDuration, isSeeking]);

  const handleSeek = (value) => {
    setIsSeeking(true);
    setProgress(value);
  };

  const handleSeekComplete = async (value) => {
    await seekTo(value);
    setIsSeeking(false);
  };

  const handlePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    setShowPlaybackRates(false);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubscribe = () => {
    if (currentEpisode) {
      if (isSubscribed(currentEpisode.id)) {
        unsubscribeFromPodcast(currentEpisode.id);
      } else {
        subscribeToPodcast(currentEpisode);
      }
    }
  };

  const handleFavorite = () => {
    if (currentEpisode) {
      toggleFavorite(currentEpisode);
    }
  };

  // 添加评论导航函数
  const handleComments = () => {
    if (currentEpisode) {
      navigation.navigate('Comments', {
        episodeId: currentEpisode.id,
        episodeTitle: currentEpisode.title
      });
    }
  };

  if (!currentEpisode) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-down" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>播放器</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>暂无播放内容</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {currentEpisode.title}
        </Text>
        <TouchableOpacity onPress={() => setShowPlaybackRates(!showPlaybackRates)}>
          <Text style={[styles.playbackRateText, { color: colors.primary }]}>
            {playbackRate}x
          </Text>
        </TouchableOpacity>
      </View>

      {/* 播放速度选择 */}
      {showPlaybackRates && (
        <View style={[styles.playbackRates, { backgroundColor: colors.card }]}>
          {playbackRates.map((rate) => (
            <TouchableOpacity
              key={rate}
              style={[
                styles.rateButton,
                { backgroundColor: playbackRate === rate ? colors.primary : colors.border }
              ]}
              onPress={() => handlePlaybackRate(rate)}
            >
              <Text style={[
                styles.rateText,
                { color: playbackRate === rate ? 'white' : colors.text }
              ]}>
                {rate}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {/* 专辑封面 */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: currentEpisode.image || 'https://via.placeholder.com/300x300?text=Cover' }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>

        {/* 节目信息 */}
        <View style={styles.infoContainer}>
          <Text style={[styles.episodeTitle, { color: colors.text }]} numberOfLines={2}>
            {currentEpisode.title}
          </Text>
          <Text style={[styles.episodeHost, { color: colors.textSecondary }]}>
            {currentEpisode.host}
          </Text>
          
          {/* 评论数量显示 */}
          <TouchableOpacity 
            style={styles.commentsInfo}
            onPress={handleComments}
          >
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
            <Text style={[styles.commentsCount, { color: colors.primary }]}>
              {getCommentCount(currentEpisode.id)} 条评论
            </Text>
          </TouchableOpacity>
          
          {/* 进度条 - 使用社区版 Slider */}
          <View style={styles.progressContainer}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(playbackPosition)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={playbackDuration || 1}
              value={progress}
              onValueChange={handleSeek}
              onSlidingComplete={handleSeekComplete}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(playbackDuration)}
            </Text>
          </View>
        </View>

        {/* 控制按钮 */}
        <View style={styles.controls}>
          {/* 第一行按钮 */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={handleFavorite} style={styles.controlButton}>
              <Ionicons 
                name={isFavorited(currentEpisode.id) ? "star" : "star-outline"} 
                size={24} 
                color={isFavorited(currentEpisode.id) ? "#FFD700" : colors.text} 
              />
            </TouchableOpacity>

            {/* 评论按钮 - 新增 */}
            <TouchableOpacity 
              onPress={handleComments}
              style={styles.controlButton}
            >
              <View style={styles.commentButton}>
                <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
                {getCommentCount(currentEpisode.id) > 0 && (
                  <View style={[styles.commentBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.commentBadgeText}>
                      {getCommentCount(currentEpisode.id)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={togglePlaylistVisible}
              style={styles.controlButton}
            >
              <Ionicons name="list" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSubscribe} style={styles.controlButton}>
              <Ionicons 
                name={isSubscribed(currentEpisode.id) ? "heart" : "heart-outline"} 
                size={24} 
                color={isSubscribed(currentEpisode.id) ? colors.primary : colors.text} 
              />
            </TouchableOpacity>
          </View>

          {/* 第二行按钮 - 播放控制 */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={previousEpisode} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={32} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={togglePlayback} 
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              disabled={isBuffering}
            >
              {isBuffering ? (
                <Ionicons name="refresh" size={32} color="white" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="white" 
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={nextEpisode} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 快速评论入口 */}
        <TouchableOpacity 
          style={[styles.quickComments, { backgroundColor: colors.card }]}
          onPress={handleComments}
        >
          <View style={styles.quickCommentsLeft}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={[styles.quickCommentsText, { color: colors.text }]}>
              查看评论
            </Text>
          </View>
          <View style={styles.quickCommentsRight}>
            <Text style={[styles.quickCommentsCount, { color: colors.textSecondary }]}>
              {getCommentCount(currentEpisode.id)} 条评论
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* 播放列表预览 */}
        {playlist && playlist.length > 0 && (
          <View style={styles.playlistSection}>
            <Text style={[styles.playlistTitle, { color: colors.text }]}>
              播放列表 ({currentIndex + 1}/{playlist.length})
            </Text>
            {playlist.slice(0, 5).map((episode, index) => (
              <TouchableOpacity
                key={episode.id}
                style={[
                  styles.playlistItem,
                  { 
                    backgroundColor: index === currentIndex ? colors.primary + '20' : 'transparent',
                    borderLeftColor: index === currentIndex ? colors.primary : 'transparent'
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.playlistItemText,
                    { 
                      color: index === currentIndex ? colors.primary : colors.text,
                      fontWeight: index === currentIndex ? 'bold' : 'normal'
                    }
                  ]}
                  numberOfLines={1}
                >
                  {index + 1}. {episode.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  playbackRateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playbackRates: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  coverContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  coverImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  episodeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  episodeHost: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  commentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  commentsCount: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  timeText: {
    fontSize: 12,
    minWidth: 40,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  controls: {
    marginBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    padding: 12,
    alignItems: 'center',
  },
  commentButton: {
    position: 'relative',
  },
  commentBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  commentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickComments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickCommentsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickCommentsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickCommentsCount: {
    fontSize: 14,
    marginRight: 8,
  },
  playlistSection: {
    marginTop: 20,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  playlistItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    marginBottom: 8,
    borderRadius: 8,
  },
  playlistItemText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});