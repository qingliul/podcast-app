// src/components/PlaylistModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';

export default function PlaylistModal() {
  const { colors } = useTheme();
  const { 
    playlist, 
    currentIndex, 
    playlistVisible, 
    togglePlaylistVisible,
    setCurrentIndex,
    removeFromPlaylist,
    clearPlaylist
  } = usePlayer();

  const renderPlaylistItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.playlistItem,
        { 
          backgroundColor: index === currentIndex ? colors.primary + '20' : colors.card,
          borderLeftColor: index === currentIndex ? colors.primary : 'transparent'
        }
      ]}
      onPress={() => {
        setCurrentIndex(index);
        togglePlaylistVisible(); // 选择后关闭弹窗
      }}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.episodeImage} />
          ) : (
            <Ionicons name="musical-notes" size={20} color={colors.textSecondary} />
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <Text 
            style={[
              styles.episodeTitle, 
              { color: index === currentIndex ? colors.primary : colors.text }
            ]} 
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.episodeHost, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.host}
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        {index === currentIndex && (
          <Ionicons name="play" size={16} color={colors.primary} />
        )}
        <TouchableOpacity 
          onPress={() => removeFromPlaylist(item.id)}
          style={styles.removeButton}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={playlistVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={togglePlaylistVisible}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* 头部 */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>播放列表</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {playlist.length} 个节目
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            {playlist.length > 0 && (
              <TouchableOpacity 
                onPress={clearPlaylist}
                style={styles.clearButton}
              >
                <Text style={[styles.clearText, { color: colors.textSecondary }]}>
                  清空
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={togglePlaylistVisible}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 播放列表内容 */}
        {playlist.length > 0 ? (
          <FlatList
            data={playlist}
            renderItem={renderPlaylistItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="list" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              播放列表为空
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              去发现页面添加节目到播放列表吧
            </Text>
            <TouchableOpacity 
              style={[styles.closeEmptyButton, { backgroundColor: colors.primary }]}
              onPress={togglePlaylistVisible}
            >
              <Text style={styles.closeEmptyButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  clearText: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  episodeImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  episodeHost: {
    fontSize: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  closeEmptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeEmptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});