// backend/server.js - 后端主文件
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 内存数据库（生产环境用真实数据库）
let episodes = [
  {
    id: '1',
    title: '科技早知道',
    host: '科技频道',
    description: '最新科技动态和趋势分析',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 2700,
    commentCount: 0
  }
];

let comments = {};
let commentIdCounter = 1;

// API路由

// 1. 获取播客列表
app.get('/api/episodes', (req, res) => {
  res.json({
    success: true,
    data: episodes,
    total: episodes.length
  });
});

// 2. 获取单个播客详情
app.get('/api/episodes/:id', (req, res) => {
  const episode = episodes.find(e => e.id === req.params.id);
  if (!episode) {
    return res.status(404).json({
      success: false,
      message: '播客不存在'
    });
  }
  res.json({
    success: true,
    data: episode
  });
});

// 3. 获取评论列表
app.get('/api/episodes/:episodeId/comments', (req, res) => {
  const episodeComments = comments[req.params.episodeId] || [];
  res.json({
    success: true,
    data: episodeComments,
    total: episodeComments.length
  });
});

// 4. 发布评论
app.post('/api/episodes/:episodeId/comments', (req, res) => {
  const { content, userId = 'user1', username = '匿名用户' } = req.body;
  
  if (!content || content.trim() === '') {
    return res.status(400).json({
      success: false,
      message: '评论内容不能为空'
    });
  }

  const newComment = {
    id: commentIdCounter++,
    episodeId: req.params.episodeId,
    userId,
    username,
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    content: content.trim(),
    likes: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 初始化或添加到评论列表
  if (!comments[req.params.episodeId]) {
    comments[req.params.episodeId] = [];
  }
  comments[req.params.episodeId].unshift(newComment);

  // 更新播客评论数
  const episode = episodes.find(e => e.id === req.params.episodeId);
  if (episode) {
    episode.commentCount = comments[req.params.episodeId].length;
  }

  res.status(201).json({
    success: true,
    data: newComment,
    message: '评论发布成功'
  });
});

// 5. 点赞评论
app.post('/api/comments/:commentId/like', (req, res) => {
  const { episodeId } = req.body;
  
  if (!episodeId) {
    return res.status(400).json({
      success: false,
      message: '缺少episodeId参数'
    });
  }

  const episodeComments = comments[episodeId];
  if (!episodeComments) {
    return res.status(404).json({
      success: false,
      message: '评论不存在'
    });
  }

  const comment = episodeComments.find(c => c.id == req.params.commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: '评论不存在'
    });
  }

  // 切换点赞状态
  if (comment.isLiked) {
    comment.likes--;
    comment.isLiked = false;
  } else {
    comment.likes++;
    comment.isLiked = true;
  }

  res.json({
    success: true,
    data: comment,
    message: comment.isLiked ? '点赞成功' : '取消点赞成功'
  });
});

// 6. 删除评论
app.delete('/api/comments/:commentId', (req, res) => {
  const { episodeId } = req.body;
  
  if (!episodeId) {
    return res.status(400).json({
      success: false,
      message: '缺少episodeId参数'
    });
  }

  const episodeComments = comments[episodeId];
  if (!episodeComments) {
    return res.status(404).json({
      success: false,
      message: '评论不存在'
    });
  }

  const commentIndex = episodeComments.findIndex(c => c.id == req.params.commentId);
  if (commentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '评论不存在'
    });
  }

  // 删除评论
  episodeComments.splice(commentIndex, 1);

  // 更新播客评论数
  const episode = episodes.find(e => e.id === episodeId);
  if (episode) {
    episode.commentCount = episodeComments.length;
  }

  res.json({
    success: true,
    message: '评论删除成功'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log('📚 可用接口:');
  console.log('  GET  /api/episodes - 获取播客列表');
  console.log('  GET  /api/episodes/:id - 获取播客详情');
  console.log('  GET  /api/episodes/:episodeId/comments - 获取评论列表');
  console.log('  POST /api/episodes/:episodeId/comments - 发布评论');
  console.log('  POST /api/comments/:commentId/like - 点赞评论');
  console.log('  DELETE /api/comments/:commentId - 删除评论');
});