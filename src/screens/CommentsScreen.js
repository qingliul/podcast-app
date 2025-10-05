// src/screens/CommentsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useComments } from '../context/CommentsContext';

export default function CommentsScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { addComment, getEpisodeComments } = useComments();
  const { episodeId, episodeTitle } = route.params;
  
  const [commentText, setCommentText] = useState('');
  const comments = getEpisodeComments(episodeId);

  const handleSubmit = async () => {
    if (commentText.trim()) {
      const success = await addComment(episodeId, commentText.trim());
      if (success) {
        setCommentText('');
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentItem, { backgroundColor: colors.card }]}>
      <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
      </View>
    </View>
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: episodeTitle,
    });
  }, [navigation, episodeTitle]);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 评论列表 */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>暂无评论</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              快来发表第一条评论吧！
            </Text>
          </View>
        }
      />

      {/* 评论输入框 */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[
            styles.input,
            { 
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.border
            }
          ]}
          placeholder="写下你的评论..."
          placeholderTextColor={colors.textSecondary}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: commentText.trim() ? colors.primary : colors.border }
          ]}
          onPress={handleSubmit}
          disabled={!commentText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={commentText.trim() ? 'white' : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});