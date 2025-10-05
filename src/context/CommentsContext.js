// src/context/CommentsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CommentsContext = createContext();

export function CommentsProvider({ children }) {
  const [comments, setComments] = useState({});

  // 加载评论
  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const stored = await AsyncStorage.getItem('@podcast_comments');
      if (stored) {
        setComments(JSON.parse(stored));
      }
    } catch (error) {
      console.log('加载评论失败:', error);
    }
  };

  // 添加评论
  const addComment = async (episodeId, text) => {
    try {
      const newComment = {
        id: Date.now().toString(),
        episodeId,
        text,
        userId: 'user1',
        username: '听众',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        timestamp: new Date().toISOString(),
        likes: 0,
      };

      const episodeComments = comments[episodeId] || [];
      const updatedComments = {
        ...comments,
        [episodeId]: [newComment, ...episodeComments],
      };

      setComments(updatedComments);
      await AsyncStorage.setItem('@podcast_comments', JSON.stringify(updatedComments));
      
      return true;
    } catch (error) {
      console.log('发布评论失败:', error);
      return false;
    }
  };

  // 获取节目的评论
  const getEpisodeComments = (episodeId) => {
    return comments[episodeId] || [];
  };

  // 获取评论数量
  const getCommentCount = (episodeId) => {
    return (comments[episodeId] || []).length;
  };

  const value = {
    comments,
    addComment,
    getEpisodeComments,
    getCommentCount,
  };

  return (
    <CommentsContext.Provider value={value}>
      {children}
    </CommentsContext.Provider>
  );
}

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within CommentsProvider');
  }
  return context;
};