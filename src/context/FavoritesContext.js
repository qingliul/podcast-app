// src/context/FavoritesContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

const initialState = {
  favorites: [], // 收藏的播客列表
  loading: false,
};

const FavoritesActions = {
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_LOADING: 'SET_LOADING',
};

function favoritesReducer(state, action) {
  switch (action.type) {
    case FavoritesActions.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload,
        loading: false,
      };
      
    case FavoritesActions.ADD_FAVORITE:
      if (state.favorites.some(fav => fav.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };
      
    case FavoritesActions.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.id !== action.payload),
      };
      
    case FavoritesActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    default:
      return state;
  }
}

export function FavoritesProvider({ children }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // 加载收藏数据
  const loadFavorites = useCallback(async () => {
    try {
      dispatch({ type: FavoritesActions.SET_LOADING, payload: true });
      
      const stored = await AsyncStorage.getItem('@podcast_favorites');
      
      if (stored) {
        const favorites = JSON.parse(stored);
        dispatch({ type: FavoritesActions.SET_FAVORITES, payload: favorites });
      } else {
        dispatch({ type: FavoritesActions.SET_FAVORITES, payload: [] });
      }
    } catch (error) {
      console.error('加载收藏失败:', error);
      dispatch({ type: FavoritesActions.SET_LOADING, payload: false });
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // 收藏播客
  const addToFavorites = useCallback(async (podcast) => {
    try {
      const favorite = {
        id: String(podcast.id),
        title: podcast.title,
        host: podcast.host,
        image: podcast.image,
        category: podcast.category,
        audioUrl: podcast.audioUrl,
        favoritedAt: new Date().toISOString(),
      };

      // 创建新的收藏列表
      const updatedFavorites = [...state.favorites, favorite];
      
      // 保存到存储
      await AsyncStorage.setItem(
        '@podcast_favorites', 
        JSON.stringify(updatedFavorites)
      );

      // 更新状态
      dispatch({ type: FavoritesActions.ADD_FAVORITE, payload: favorite });
      
      console.log('✅ 收藏成功:', podcast.title);
      
    } catch (error) {
      console.error('❌ 收藏失败:', error);
    }
  }, [state.favorites]);

  // 取消收藏
  const removeFromFavorites = useCallback(async (podcastId) => {
    try {
      const updatedFavorites = state.favorites.filter(
        fav => fav.id !== String(podcastId)
      );
      
      // 保存到存储
      await AsyncStorage.setItem(
        '@podcast_favorites',
        JSON.stringify(updatedFavorites)
      );

      // 更新状态
      dispatch({ type: FavoritesActions.REMOVE_FAVORITE, payload: String(podcastId) });
      
      console.log('✅ 取消收藏成功');
      
    } catch (error) {
      console.error('❌ 取消收藏失败:', error);
    }
  }, [state.favorites]);

  // 检查是否已收藏
  const isFavorited = useCallback((podcastId) => {
    return state.favorites.some(fav => fav.id === String(podcastId));
  }, [state.favorites]);

  // 切换收藏状态
  const toggleFavorite = useCallback(async (podcast) => {
    if (isFavorited(podcast.id)) {
      await removeFromFavorites(podcast.id);
    } else {
      await addToFavorites(podcast);
    }
  }, [isFavorited, addToFavorites, removeFromFavorites]);

  const value = {
    favorites: state.favorites,
    loading: state.loading,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    toggleFavorite,
    loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};