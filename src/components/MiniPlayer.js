// src/components/MiniPlayer.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { 
    currentEpisode, 
    isPlaying, 
    playbackPosition, 
    playbackDuration,
    togglePlayback,
    nextEpisode,
    previousEpisode,
    isBuffering,
    stopPlayback
  } = usePlayer();

  // 计算播放进度百分比
  const progressPercent = playbackDuration > 0 
    ? (playbackPosition / playbackDuration) * 100 
    : 0;

  const closePlayer = async () => {
  console.log('关闭播放器');
  try {
    await stopPlayback();
  } catch (error) {
    console.log('关闭播放器时的小错误:', error.message);
    // 这个错误可以安全忽略，因为 stopPlayback 已经处理了所有情况
  }
};

  const openFullPlayer = () => {
    navigation.navigate('Player');
  };

  // 格式化时间
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 如果没有当前播放的节目，不显示迷你播放器
  if (!currentEpisode) {
    return null;
  }

  // 安全地获取主机信息
  const getHostText = () => {
    const host = currentEpisode.host || '未知主播';
    return isBuffering ? `${host} · 缓冲中...` : host;
  };

  // 安全地获取时间文本
  const getTimeText = () => {
    return isBuffering ? '缓冲中...' : formatTime(playbackPosition);
  };

  // 处理控制按钮点击 - 修复事件处理
  const handleControlPress = (handler) => {
  return async () => {
    try {
      await handler();
    } catch (error) {
      console.log('控制操作失败:', error.message);
      // 这里可以添加用户提示，比如 Toast 消息
    }
  };
};
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}
      onPress={openFullPlayer}
      activeOpacity={0.8}
    >
      {/* 进度条 */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progress, 
            { 
              backgroundColor: colors.primary,
              width: `${progressPercent}%` 
            }
          ]} 
        />
      </View>

      <View style={styles.content}>
        {/* 关闭按钮 - 单独处理点击事件，避免触发导航 */}
        <TouchableOpacity 
          onPress={closePlayer} 
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* 节目信息 */}
        <View style={styles.episodeInfo}>
          <Text style={[styles.episodeTitle, { color: colors.text }]} numberOfLines={1}>
            {currentEpisode.title || '未知节目'}
          </Text>
          <Text style={[styles.episodeHost, { color: colors.textSecondary }]} numberOfLines={1}>
            {getHostText()}
          </Text>
        </View>

        {/* 控制按钮 - 使用不同的方式阻止导航 */}
        <View style={styles.controls}>
          <TouchableOpacity 
            onPress={handleControlPress(previousEpisode)} 
            style={styles.controlButton}
          >
            <Ionicons name="play-skip-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleControlPress(togglePlayback)} 
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            disabled={isBuffering}
          >
            {isBuffering ? (
              <Ionicons name="refresh" size={20} color="white" />
            ) : (
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={20} 
                color="white" 
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleControlPress(nextEpisode)} 
            style={styles.controlButton}
          >
            <Ionicons name="play-skip-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* 时间显示 */}
        <View style={styles.timeInfo}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {getTimeText()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 49,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  episodeInfo: {
    flex: 1,
    marginRight: 12,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  episodeHost: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  controlButton: {
    padding: 4,
  },
  playButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  timeInfo: {
    minWidth: 40,
  },
  timeText: {
    fontSize: 12,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -4,
    padding: 4,
    zIndex: 1,
  },
});