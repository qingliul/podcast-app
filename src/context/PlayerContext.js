// src/context/PlayerContext.js - 修复版本
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

// 创建上下文
const PlayerContext = createContext();

// 初始状态
const initialState = {
  currentEpisode: null,
  isPlaying: false,
  playbackPosition: 0,
  playbackDuration: 0,
  playbackRate: 1.0,
  isBuffering: false,
  playlist: [],
  currentIndex: -1,
  playlistVisible: false,
};

// 动作类型
export const PlayerActions = {
  SET_CURRENT_EPISODE: 'SET_CURRENT_EPISODE',
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  TOGGLE_PLAYBACK: 'TOGGLE_PLAYBACK',
  SET_POSITION: 'SET_POSITION',
  SET_DURATION: 'SET_DURATION',
  SET_PLAYBACK_RATE: 'SET_PLAYBACK_RATE',
  SET_BUFFERING: 'SET_BUFFERING',
  SET_PLAYLIST: 'SET_PLAYLIST',
  NEXT_EPISODE: 'NEXT_EPISODE',
  PREVIOUS_EPISODE: 'PREVIOUS_EPISODE',
  SEEK_TO: 'SEEK_TO',
  ADD_TO_PLAYLIST: 'ADD_TO_PLAYLIST',
  REMOVE_FROM_PLAYLIST: 'REMOVE_FROM_PLAYLIST',
  CLEAR_PLAYLIST: 'CLEAR_PLAYLIST',
  SET_CURRENT_INDEX: 'SET_CURRENT_INDEX',
  TOGGLE_PLAYLIST_VISIBLE: 'TOGGLE_PLAYLIST_VISIBLE',
};

// Reducer 函数
function playerReducer(state, action) {
  switch (action.type) {
    case PlayerActions.SET_CURRENT_EPISODE:
      return {
        ...state,
        currentEpisode: action.payload,
        playbackPosition: 0,
        isPlaying: true,
      };
    case PlayerActions.PLAY:
      return { ...state, isPlaying: true };
    case PlayerActions.PAUSE:
      return { ...state, isPlaying: false };
    case PlayerActions.TOGGLE_PLAYBACK:
      return { ...state, isPlaying: !state.isPlaying };
    case PlayerActions.SET_POSITION:
      return { ...state, playbackPosition: action.payload };
    case PlayerActions.SET_DURATION:
      return { ...state, playbackDuration: action.payload };
    case PlayerActions.SET_PLAYBACK_RATE:
      return { ...state, playbackRate: action.payload };
    case PlayerActions.SET_BUFFERING:
      return { ...state, isBuffering: action.payload };
    case PlayerActions.SET_PLAYLIST:
      return {
        ...state,
        playlist: action.payload.episodes,
        currentIndex: action.payload.currentIndex || 0,
        currentEpisode: action.payload.episodes[action.payload.currentIndex || 0],
      };
    case PlayerActions.NEXT_EPISODE:
      if (state.playlist.length === 0) return state;
      const nextIndex = (state.currentIndex + 1) % state.playlist.length;
      return {
        ...state,
        currentIndex: nextIndex,
        currentEpisode: state.playlist[nextIndex],
        playbackPosition: 0,
        isPlaying: true,
      };
    case PlayerActions.PREVIOUS_EPISODE:
      if (state.playlist.length === 0) return state;
      const prevIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
      return {
        ...state,
        currentIndex: prevIndex,
        currentEpisode: state.playlist[prevIndex],
        playbackPosition: 0,
        isPlaying: true,
      };
    case PlayerActions.SEEK_TO:
      return { ...state, playbackPosition: action.payload };
    case PlayerActions.ADD_TO_PLAYLIST:
      if (state.playlist.some(ep => ep.id === action.payload.id)) {
        return state;
      }
      const newPlaylist = [...state.playlist, action.payload];
      return {
        ...state,
        playlist: newPlaylist,
        currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
        currentEpisode: state.currentIndex === -1 ? action.payload : state.currentEpisode,
      };
    case PlayerActions.REMOVE_FROM_PLAYLIST:
      const filteredPlaylist = state.playlist.filter(ep => ep.id !== action.payload);
      let newIndex = state.currentIndex;
      
      if (state.playlist[state.currentIndex]?.id === action.payload) {
        if (filteredPlaylist.length > 0) {
          newIndex = Math.min(state.currentIndex, filteredPlaylist.length - 1);
        } else {
          newIndex = -1;
        }
      }
      else if (state.playlist.findIndex(ep => ep.id === action.payload) < state.currentIndex) {
        newIndex = state.currentIndex - 1;
      }
      
      return {
        ...state,
        playlist: filteredPlaylist,
        currentIndex: newIndex,
        currentEpisode: newIndex >= 0 ? filteredPlaylist[newIndex] : null,
      };
    case PlayerActions.CLEAR_PLAYLIST:
      return {
        ...state,
        playlist: [],
        currentIndex: -1,
        currentEpisode: null,
        isPlaying: false,
      };
    case PlayerActions.SET_CURRENT_INDEX:
      if (action.payload >= 0 && action.payload < state.playlist.length) {
        return {
          ...state,
          currentIndex: action.payload,
          currentEpisode: state.playlist[action.payload],
          playbackPosition: 0,
          isPlaying: true,
        };
      }
      return state;
    case PlayerActions.TOGGLE_PLAYLIST_VISIBLE:
      return {
        ...state,
        playlistVisible: !state.playlistVisible,
      };
    default:
      return state;
  }
}

// Provider 组件
export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const soundRef = useRef(null);
  const isPlayingRef = useRef(false);

  // 初始化音频 - 修复配置
useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        console.log('✅ 音频模式设置成功');
      } catch (error) {
        console.log('⚠️ 音频模式设置小问题:', error.message);
      }
    }
    setupAudio();
  }, []);

  // 检查声音是否可用的辅助函数 - 简化版本
  const isSoundReady = () => {
    return soundRef.current !== null;
  };

  // 播放状态更新回调
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      dispatch({ type: PlayerActions.SET_POSITION, payload: status.positionMillis / 1000 });
      dispatch({ type: PlayerActions.SET_DURATION, payload: status.durationMillis / 1000 });

      isPlayingRef.current = status.isPlaying;

      // 同步播放状态
      if (status.isPlaying !== state.isPlaying) {
        console.log('🔄 同步播放状态:', status.isPlaying ? '播放' : '暂停');
        if (status.isPlaying) {
          dispatch({ type: PlayerActions.PLAY });
        } else {
          dispatch({ type: PlayerActions.PAUSE });
        }
      }

      if (status.didJustFinish) {
        console.log('🎵 播放完成，自动下一首');
        dispatch({ type: PlayerActions.NEXT_EPISODE });
      }

      // 记录缓冲状态
      if (status.isBuffering !== state.isBuffering) {
        dispatch({ type: PlayerActions.SET_BUFFERING, payload: status.isBuffering });
      }

    } else if (status.error) {
      console.error('❌ 播放状态错误:', status.error);
    }
  };

  // 安全停止播放（内部使用）
  const safeStopPlayback = async () => {
    try {
      if (soundRef.current) {
        console.log('🛑 开始安全停止播放');
        const isReady = await isSoundReady();
        if (isReady) {
          console.log('⏹️ 停止声音播放');
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          console.log('✅ 声音安全停止和卸载');
        } else {
          console.log('🔇 声音未就绪，直接清理');
        }
        soundRef.current = null;
      }
      isPlayingRef.current = false;
      console.log('✅ 播放状态已重置');
    } catch (error) {
      console.log('❌ 安全停止播放时的错误:', error.message);
      soundRef.current = null;
      isPlayingRef.current = false;
    }
  };

  // 播放节目
  const playEpisode = async (episode) => {
    try {
      console.log('🎵 开始播放:', episode.title);
      console.log('🔗 音频URL:', episode.audioUrl);
      
      // 先安全停止当前播放
      await safeStopPlayback();

      dispatch({ type: PlayerActions.SET_CURRENT_EPISODE, payload: episode });
      dispatch({ type: PlayerActions.SET_BUFFERING, payload: true });

      // 创建新的声音对象
      console.log('📦 创建声音对象...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: episode.audioUrl },
        { 
          shouldPlay: true, 
          rate: state.playbackRate,
          volume: 1.0,
          progressUpdateIntervalMillis: 1000, // 更长的更新间隔减少性能开销
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      isPlayingRef.current = true;
      dispatch({ type: PlayerActions.SET_BUFFERING, payload: false });

      console.log('✅ 播放开始成功');

      // 定期检查播放状态
      const checkPlayback = async () => {
        if (soundRef.current === sound) { // 确保还是同一个声音对象
          const status = await sound.getStatusAsync();
          if (status.isLoaded && !status.isPlaying && isPlayingRef.current) {
            console.log('🔄 检测到播放停止，尝试恢复...');
            await sound.playAsync();
          }
        }
      };

      // 每30秒检查一次播放状态
      const intervalId = setInterval(checkPlayback, 30000);
      
      // 清理函数
      return () => clearInterval(intervalId);

    } catch (error) {
      console.error('❌ 播放错误:', error);
      console.error('🔧 错误详情:', error.message);
      dispatch({ type: PlayerActions.SET_BUFFERING, payload: false });
      
      // 播放失败时重置状态
      dispatch({ type: PlayerActions.SET_CURRENT_EPISODE, payload: null });
      isPlayingRef.current = false;
    }
  };

  // 播放/暂停切换
  const togglePlayback = async () => {
    console.log('🔄 切换播放状态，当前:', state.isPlaying ? '播放' : '暂停');
    
    if (!(await isSoundReady())) {
      console.log('❌ 声音未准备好，无法切换播放状态');
      // 如果声音未准备好但当前有节目，尝试重新播放
      if (state.currentEpisode) {
        console.log('🔄 尝试重新播放当前节目');
        await playEpisode(state.currentEpisode);
      }
      return;
    }

    try {
      if (state.isPlaying) {
        console.log('⏸️ 暂停播放');
        await soundRef.current.pauseAsync();
        dispatch({ type: PlayerActions.PAUSE });
        isPlayingRef.current = false;
      } else {
        console.log('▶️ 开始播放');
        await soundRef.current.playAsync();
        dispatch({ type: PlayerActions.PLAY });
        isPlayingRef.current = true;
      }
    } catch (error) {
      console.error('❌ 播放控制错误:', error.message);
      // 如果操作失败，尝试重新加载声音
      if (state.currentEpisode) {
        console.log('🔄 播放控制失败，尝试重新加载声音...');
        await playEpisode(state.currentEpisode);
      }
    }
  };

  // 跳转到指定位置
  const seekTo = async (position) => {
    console.log('⏩ 跳转到:', position, '秒');
    
    if (!(await isSoundReady())) {
      console.log('❌ 声音未准备好，无法跳转');
      return;
    }

    try {
      await soundRef.current.setPositionAsync(position * 1000);
      dispatch({ type: PlayerActions.SET_POSITION, payload: position });
      console.log('✅ 跳转成功');
    } catch (error) {
      console.error('❌ 跳转错误:', error.message);
    }
  };

  // 设置播放速度
  const setPlaybackRate = async (rate) => {
    console.log('🎚️ 设置播放速度:', rate + 'x');
    
    if (!(await isSoundReady())) {
      console.log('❌ 声音未准备好，无法设置速度');
      return;
    }

    try {
      await soundRef.current.setRateAsync(rate, true);
      dispatch({ type: PlayerActions.SET_PLAYBACK_RATE, payload: rate });
      console.log('✅ 播放速度设置成功');
    } catch (error) {
      console.error('❌ 设置播放速度错误:', error.message);
    }
  };

  // 停止播放（对外暴露）
  const stopPlayback = async () => {
    console.log('🛑 停止播放');
    try {
      await safeStopPlayback();
      dispatch({ type: PlayerActions.SET_CURRENT_EPISODE, payload: null });
      dispatch({ type: PlayerActions.SET_POSITION, payload: 0 });
      dispatch({ type: PlayerActions.SET_DURATION, payload: 0 });
      dispatch({ type: PlayerActions.PAUSE });
      console.log('✅ 播放完全停止');
    } catch (error) {
      console.error('❌ 停止播放错误:', error.message);
      // 即使出错也要重置状态
      dispatch({ type: PlayerActions.SET_CURRENT_EPISODE, payload: null });
      dispatch({ type: PlayerActions.SET_POSITION, payload: 0 });
      dispatch({ type: PlayerActions.SET_DURATION, payload: 0 });
      dispatch({ type: PlayerActions.PAUSE });
      isPlayingRef.current = false;
    }
  };

  // 设置播放列表
  const setPlaylist = (episodes, startIndex = 0) => {
    dispatch({ 
      type: PlayerActions.SET_PLAYLIST, 
      payload: { episodes, currentIndex: startIndex } 
    });
  };

  // 下一集
  const nextEpisode = () => {
    dispatch({ type: PlayerActions.NEXT_EPISODE });
  };

  // 上一集
  const previousEpisode = () => {
    dispatch({ type: PlayerActions.PREVIOUS_EPISODE });
  };

  // 添加到播放列表
  const addToPlaylist = (episode) => {
    dispatch({ type: PlayerActions.ADD_TO_PLAYLIST, payload: episode });
  };

  // 从播放列表移除
  const removeFromPlaylist = (episodeId) => {
    dispatch({ type: PlayerActions.REMOVE_FROM_PLAYLIST, payload: episodeId });
  };

  // 清空播放列表
  const clearPlaylist = () => {
    dispatch({ type: PlayerActions.CLEAR_PLAYLIST });
  };

  // 设置当前播放索引
  const setCurrentIndex = (index) => {
    dispatch({ type: PlayerActions.SET_CURRENT_INDEX, payload: index });
  };

  // 切换播放列表可见性
  const togglePlaylistVisible = () => {
    dispatch({ type: PlayerActions.TOGGLE_PLAYLIST_VISIBLE });
  };

  // 添加到播放列表并播放
  const addToPlaylistAndPlay = (episode) => {
    addToPlaylist(episode);
    if (state.playlist.length === 0) {
      playEpisode(episode);
    }
  };

  const value = {
    ...state,
    playEpisode,
    togglePlayback,
    seekTo,
    stopPlayback,
    setPlaybackRate,
    setPlaylist,
    nextEpisode,
    previousEpisode,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    setCurrentIndex,
    togglePlaylistVisible,
    addToPlaylistAndPlay,
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      console.log('🧹 清理播放器资源');
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(error => {
          console.log('清理声音资源时的小错误:', error.message);
        });
      }
    };
  }, []);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

// 自定义 Hook
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}