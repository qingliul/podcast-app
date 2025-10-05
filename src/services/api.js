// src/services/api.js - 智能API服务
import AsyncStorage from '@react-native-async-storage/async-storage';

// 配置
const CONFIG = {
  useBackend: false, // 切换开关 - 改为true即可接入后端
  backendUrl: 'http://localhost:3000/api',
  storageKeys: {
    COMMENTS: '@podcast_comments',
    EPISODES: '@podcast_episodes',
  }
};

class ApiService {
  constructor() {
    this.useBackend = CONFIG.useBackend;
    this.baseURL = CONFIG.backendUrl;
  }

  // 统一的请求方法
  async request(endpoint, options = {}) {
    if (this.useBackend) {
      return this._backendRequest(endpoint, options);
    } else {
      return this._localRequest(endpoint, options);
    }
  }

  // 后端请求
  async _backendRequest(endpoint, options) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      if (options.body) {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('后端API请求失败:', error);
      throw error;
    }
  }

  // 本地存储请求
  async _localRequest(endpoint, options) {
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100));

      switch (options.method) {
        case 'GET':
          return await this._handleLocalGet(endpoint);
        case 'POST':
          return await this._handleLocalPost(endpoint, options.body);
        case 'DELETE':
          return await this._handleLocalDelete(endpoint, options.body);
        default:
          return await this._handleLocalGet(endpoint);
      }
    } catch (error) {
      console.error('本地存储请求失败:', error);
      throw error;
    }
  }

  // 本地GET处理
  async _handleLocalGet(endpoint) {
    if (endpoint.startsWith('/episodes/') && endpoint.endsWith('/comments')) {
      const episodeId = endpoint.split('/')[2];
      const comments = await this._getLocalComments(episodeId);
      return {
        success: true,
        data: comments,
        total: comments.length
      };
    }
    
    if (endpoint === '/episodes') {
      const episodes = await this._getLocalEpisodes();
      return {
        success: true,
        data: episodes,
        total: episodes.length
      };
    }

    throw new Error(`本地接口不存在: ${endpoint}`);
  }

  // 本地POST处理
  async _handleLocalPost(endpoint, body) {
    if (endpoint.startsWith('/episodes/') && endpoint.endsWith('/comments')) {
      const episodeId = endpoint.split('/')[2];
      const newComment = await this._createLocalComment(episodeId, body);
      return {
        success: true,
        data: newComment,
        message: '评论发布成功'
      };
    }

    if (endpoint.includes('/comments/') && endpoint.endsWith('/like')) {
      const commentId = endpoint.split('/')[2];
      const updatedComment = await this._likeLocalComment(commentId, body);
      return {
        success: true,
        data: updatedComment,
        message: '点赞成功'
      };
    }

    throw new Error(`本地接口不存在: ${endpoint}`);
  }

  // 本地DELETE处理
  async _handleLocalDelete(endpoint, body) {
    if (endpoint.startsWith('/comments/')) {
      const commentId = endpoint.split('/')[2];
      await this._deleteLocalComment(commentId, body);
      return {
        success: true,
        message: '评论删除成功'
      };
    }

    throw new Error(`本地接口不存在: ${endpoint}`);
  }

  // 本地存储操作
  async _getLocalComments(episodeId) {
    try {
      const allComments = await AsyncStorage.getItem(CONFIG.storageKeys.COMMENTS);
      const commentsMap = allComments ? JSON.parse(allComments) : {};
      return commentsMap[episodeId] || [];
    } catch (error) {
      console.error('获取本地评论失败:', error);
      return [];
    }
  }

  async _createLocalComment(episodeId, body) {
    const { content, userId = 'user1', username = '当前用户' } = body;
    
    if (!content || content.trim() === '') {
      throw new Error('评论内容不能为空');
    }

    const newComment = {
      id: Date.now().toString(),
      episodeId,
      userId,
      username,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      content: content.trim(),
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 获取现有评论
    const allComments = await AsyncStorage.getItem(CONFIG.storageKeys.COMMENTS);
    const commentsMap = allComments ? JSON.parse(allComments) : {};
    
    // 添加新评论
    if (!commentsMap[episodeId]) {
      commentsMap[episodeId] = [];
    }
    commentsMap[episodeId].unshift(newComment);

    // 保存回存储
    await AsyncStorage.setItem(
      CONFIG.storageKeys.COMMENTS,
      JSON.stringify(commentsMap)
    );

    return newComment;
  }

  async _likeLocalComment(commentId, body) {
    const { episodeId } = body;
    
    const allComments = await AsyncStorage.getItem(CONFIG.storageKeys.COMMENTS);
    const commentsMap = allComments ? JSON.parse(allComments) : {};
    const episodeComments = commentsMap[episodeId] || [];

    const commentIndex = episodeComments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('评论不存在');
    }

    // 切换点赞状态
    const comment = episodeComments[commentIndex];
    if (comment.isLiked) {
      comment.likes--;
      comment.isLiked = false;
    } else {
      comment.likes++;
      comment.isLiked = true;
    }
    comment.updatedAt = new Date().toISOString();

    // 更新存储
    commentsMap[episodeId] = episodeComments;
    await AsyncStorage.setItem(
      CONFIG.storageKeys.COMMENTS,
      JSON.stringify(commentsMap)
    );

    return comment;
  }

  async _deleteLocalComment(commentId, body) {
    const { episodeId } = body;
    
    const allComments = await AsyncStorage.getItem(CONFIG.storageKeys.COMMENTS);
    const commentsMap = allComments ? JSON.parse(allComments) : {};
    const episodeComments = commentsMap[episodeId] || [];

    const commentIndex = episodeComments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('评论不存在');
    }

    // 删除评论
    episodeComments.splice(commentIndex, 1);
    commentsMap[episodeId] = episodeComments;

    await AsyncStorage.setItem(
      CONFIG.storageKeys.COMMENTS,
      JSON.stringify(commentsMap)
    );
  }

  async _getLocalEpisodes() {
    // 返回模拟数据
    return [
      {
        id: '1',
        title: '科技早知道',
        host: '科技频道',
        description: '最新科技动态和趋势分析，带你了解前沿科技发展',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 2700,
        commentCount: 0
      },
       {
    id: '2',
    title: '深夜读书会',
    host: '文学电台',
    category: '文化',
    duration: '30分钟',
    listeners: '8.3万',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '经典文学作品解读和分享，感受文字的魅力',
    isFeatured: true,
    rating: 4.6
  },
  {
    id: '3',
    title: '商业思维',
    host: '商业洞察',
    category: '商业',
    duration: '50分钟',
    listeners: '15.2万',
    image: 'https://images.unsplash.com/photo-1664575198263-269a022d6f14?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '商业案例分析和思维训练，提升商业认知',
    isFeatured: true,
    rating: 4.9
  },
  {
    id: '4',
    title: '心理健康指南',
    host: '心理专家',
    category: '健康',
    duration: '25分钟',
    listeners: '6.7万',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '心理健康知识和自我调节方法，关注内心成长',
    rating: 4.5
  },
  {
    id: '5',
    title: '历史那些事',
    host: '历史研究会',
    category: '历史',
    duration: '40分钟',
    listeners: '9.8万',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '历史事件和人物故事，以史为鉴知兴替',
    rating: 4.7
  },
  {
    id: '6',
    title: '音乐故事',
    host: '音乐电台',
    category: '音乐',
    duration: '35分钟',
    listeners: '11.4万',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '音乐背后的故事和创作历程，感受音乐的力量',
    rating: 4.8
  },
  {
    id: '7',
    title: '人工智能前沿',
    host: 'AI实验室',
    category: '科技',
    duration: '55分钟',
    listeners: '18.9万',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '人工智能最新发展和应用，探索AI未来',
    rating: 4.9
  },
  {
    id: '8',
    title: '投资理财入门',
    host: '财经学院',
    category: '商业',
    duration: '38分钟',
    listeners: '22.3万',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '基础投资理财知识和技巧，实现财富增值',
    rating: 4.6
  },
  {
    id: '9',
    title: '英语学习指南',
    host: '语言大师',
    category: '教育',
    duration: '28分钟',
    listeners: '14.2万',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '实用英语学习方法和技巧，提升语言能力',
    rating: 4.7
  },
  {
    id: '10',
    title: '健身与营养',
    host: '健康生活',
    category: '健康',
    duration: '32分钟',
    listeners: '7.8万',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: '科学健身方法和营养搭配，打造健康体魄',
    rating: 4.5
  }
    ];
  }

  // 工具方法：切换后端模式
  setBackendMode(useBackend) {
    this.useBackend = useBackend;
    console.log(`🔧 API模式切换到: ${useBackend ? '后端' : '本地'}`);
  }
}

// 创建全局实例
export const apiService = new ApiService();

// 导出具体的API方法
export const commentAPI = {
  getComments: (episodeId) => 
    apiService.request(`/episodes/${episodeId}/comments`),
  
  createComment: (episodeId, content) =>
    apiService.request(`/episodes/${episodeId}/comments`, {
      method: 'POST',
      body: { content },
    }),
  
  likeComment: (commentId, episodeId) =>
    apiService.request(`/comments/${commentId}/like`, {
      method: 'POST',
      body: { episodeId },
    }),
  
  deleteComment: (commentId, episodeId) =>
    apiService.request(`/comments/${commentId}`, {
      method: 'DELETE',
      body: { episodeId },
    }),
};

export const episodeAPI = {
  getEpisodes: () => apiService.request('/episodes'),
  getEpisode: (id) => apiService.request(`/episodes/${id}`),
};