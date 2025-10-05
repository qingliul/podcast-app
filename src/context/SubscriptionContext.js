// src/context/SubscriptionContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubscriptionContext = createContext();

const initialState = {
  subscriptions: [],
  loading: false,
};

const SubscriptionActions = {
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION', 
  REMOVE_SUBSCRIPTION: 'REMOVE_SUBSCRIPTION',
  SET_LOADING: 'SET_LOADING',
};

function subscriptionReducer(state, action) {
  switch (action.type) {
    case SubscriptionActions.SET_SUBSCRIPTIONS:
      return {
        ...state,
        subscriptions: action.payload,
        loading: false,
      };
      
    case SubscriptionActions.ADD_SUBSCRIPTION:
      // 防止重复订阅
      if (state.subscriptions.some(sub => sub.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        subscriptions: [...state.subscriptions, action.payload],
      };
      
    case SubscriptionActions.REMOVE_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: state.subscriptions.filter(sub => sub.id !== action.payload),
      };
      
    case SubscriptionActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    default:
      return state;
  }
}

export function SubscriptionProvider({ children }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);

  // 加载订阅数据
  const loadSubscriptions = useCallback(async () => {
    try {
      dispatch({ type: SubscriptionActions.SET_LOADING, payload: true });
      console.log('🔄 加载订阅数据...');
      
      const stored = await AsyncStorage.getItem('@podcast_subscriptions');
      console.log('📦 存储数据:', stored);
      
      if (stored) {
        const subscriptions = JSON.parse(stored);
        console.log('✅ 加载到的订阅:', subscriptions);
        dispatch({ type: SubscriptionActions.SET_SUBSCRIPTIONS, payload: subscriptions });
      } else {
        console.log('ℹ️ 无订阅数据');
        dispatch({ type: SubscriptionActions.SET_SUBSCRIPTIONS, payload: [] });
      }
    } catch (error) {
      console.error('❌ 加载失败:', error);
      dispatch({ type: SubscriptionActions.SET_LOADING, payload: false });
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // 订阅播客
  const subscribeToPodcast = useCallback(async (podcast) => {
    try {
      console.log('🎯 订阅:', podcast.title, 'ID:', podcast.id);
      
      const subscription = {
        id: String(podcast.id), // 确保ID是字符串
        title: podcast.title,
        host: podcast.host,
        image: podcast.image,
        category: podcast.category,
        audioUrl: podcast.audioUrl, // 新增
        subscribedAt: new Date().toISOString(),
      };

      console.log('📝 创建订阅对象:', subscription);

      // 创建新的订阅列表
      const currentSubs = state.subscriptions;
      const updatedSubscriptions = [...currentSubs, subscription];
      
      console.log('💾 保存到存储:', updatedSubscriptions);
      
      // 保存到存储
      await AsyncStorage.setItem(
        '@podcast_subscriptions', 
        JSON.stringify(updatedSubscriptions)
      );

      // 更新状态
      dispatch({ type: SubscriptionActions.ADD_SUBSCRIPTION, payload: subscription });
      
      console.log('✅ 订阅完成，当前订阅数:', updatedSubscriptions.length);
      
    } catch (error) {
      console.error('❌ 订阅失败:', error);
    }
  }, [state.subscriptions]);

  // 取消订阅
  const unsubscribeFromPodcast = useCallback(async (podcastId) => {
    try {
      console.log('🎯 取消订阅 ID:', podcastId);
      
      const updatedSubscriptions = state.subscriptions.filter(
        sub => sub.id !== String(podcastId)
      );
      
      // 保存到存储
      await AsyncStorage.setItem(
        '@podcast_subscriptions',
        JSON.stringify(updatedSubscriptions)
      );

      // 更新状态
      dispatch({ type: SubscriptionActions.REMOVE_SUBSCRIPTION, payload: String(podcastId) });
      
      console.log('✅ 取消订阅完成，剩余订阅数:', updatedSubscriptions.length);
      
    } catch (error) {
      console.error('❌ 取消订阅失败:', error);
    }
  }, [state.subscriptions]);

  // 检查是否已订阅
  const isSubscribed = useCallback((podcastId) => {
    const subscribed = state.subscriptions.some(sub => sub.id === String(podcastId));
    console.log(`🔍 检查订阅: ${podcastId} -> ${subscribed}`);
    return subscribed;
  }, [state.subscriptions]);

  const value = {
    subscriptions: state.subscriptions,
    loading: state.loading,
    subscribeToPodcast,
    unsubscribeFromPodcast,
    isSubscribed,
    loadSubscriptions,
  };

  console.log('🔄 SubscriptionContext 渲染，订阅数:', state.subscriptions.length);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};