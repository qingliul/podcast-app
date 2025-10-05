// src/components/CommentsSection.js
import React, { useState, useRef } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useComments } from '../context/CommentsContext';

export default function CommentsSection({ episodeId, episodeTitle }) {
  const { colors } = useTheme();
  const { 
    getEpisodeComments, 
    addComment, 
    deleteComment, 
    likeComment 
  } = useComments();
  
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const comments = getEpisodeComments(episodeId);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    const success = await addComment(episodeId, commentText.trim());
    
    if (success) {
      setCommentText('');
      inputRef.current?.blur();
    } else {
      Alert.alert('错误', '评论发布失败，请重试');
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      '删除评论',
      '确定要删除这条评论吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => deleteComment(episodeId, commentId)
        }
      ]
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentItem, { backgroundColor: colors.card }]}>
      <Image 
        source={{ uri: item.userAvatar }} 
        style={styles.avatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.username}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.text}
        </Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => likeComment(episodeId, item.id)}
          >
            <Ionicons 
              name={item.isLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={item.isLiked ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.likeCount, 
              { color: item.isLiked ? colors.primary : colors.textSecondary }
            ]}>
              {item.likes > 0 ? item.likes : ''}
            </Text>
          </TouchableOpacity>
          
          {item.userId === 'current_user' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteComment(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          评论 ({comments.length})
        </Text>
      </View>

      {comments.length > 0 ? (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={60} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            暂无评论
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            成为第一个评论的人吧！
          </Text>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput, 
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
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: commentText.trim() ? colors.primary : colors.border,
              opacity: commentText.trim() && !isSubmitting ? 1 : 0.5
            }
          ]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || isSubmitting}
        >
          <Ionicons 
            name="send" 
            size={18} 
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
    marginBottom: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
  },
  likeCount: {
    fontSize: 12,
    marginLeft: 4,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});