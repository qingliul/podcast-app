// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Modal,
  StatusBar,
  TextInput,
  Alert,
  FlatList
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { subscriptions } = useSubscription();
  
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateCenterModal, setShowCreateCenterModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(isDark ? 'dark' : 'light');

  // 用户数据
  const [userData, setUserData] = useState({
    id: '123456',
    username: '播客爱好者',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    following: 45,
    followers: 128,
    subscriptions: subscriptions.length,
    listeningTime: '156小时',
    level: 'Lv.12',
    bio: '热爱生活，喜欢听播客的普通人'
  });

  // 编辑资料表单状态 - 修复：使用独立状态
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar: ''
  });

  // 通知数据
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: '新节目上线',
      message: '你订阅的「科技早知道」发布了新节目「人工智能的未来」',
      time: '2小时前',
      read: false,
      type: 'subscription'
    },
    {
      id: '2',
      title: '系统通知',
      message: '你的账号在另一台设备上登录，如非本人操作请及时修改密码',
      time: '1天前',
      read: false,
      type: 'system'
    }
  ]);

  // 完整的收听历史数据
  const [listeningHistory] = useState([
    { id: '1', title: '科技早知道', host: '科技频道', date: '2024-01-15', duration: '45分钟', progress: '100%' },
    { id: '2', title: '深夜读书会', host: '文学电台', date: '2024-01-14', duration: '30分钟', progress: '80%' },
    { id: '3', title: '商业思维', host: '商业洞察', date: '2024-01-13', duration: '50分钟', progress: '60%' },
    { id: '4', title: '心理健康指南', host: '心理专家', date: '2024-01-12', duration: '25分钟', progress: '100%' },
    { id: '5', title: '历史那些事', host: '历史研究会', date: '2024-01-11', duration: '40分钟', progress: '45%' },
    { id: '6', title: '音乐故事', host: '音乐电台', date: '2024-01-10', duration: '35分钟', progress: '90%' },
    { id: '7', title: '投资理财入门', host: '财经学院', date: '2024-01-09', duration: '38分钟', progress: '75%' },
    { id: '8', title: '英语学习指南', host: '语言大师', date: '2024-01-08', duration: '28分钟', progress: '100%' }
  ]);

  // 最近收听（只显示前4条）
  const recentListens = listeningHistory.slice(0, 4);

  // 设置选项
  const [settings, setSettings] = useState({
    autoPlay: true,
    downloadQuality: 'high',
    dataSaver: false,
    notifications: true,
    privateMode: false
  });

  // 主题选项
  const themeOptions = [
    { id: 'light', name: '浅色模式', icon: 'sunny', description: '明亮的界面风格' },
    { id: 'dark', name: '深色模式', icon: 'moon', description: '护眼的深色风格' },
    { id: 'auto', name: '跟随系统', icon: 'phone-portrait', description: '自动匹配系统主题' }
  ];

  // 监听订阅数量变化
  useEffect(() => {
    setUserData(prev => ({
      ...prev,
      subscriptions: subscriptions.length
    }));
  }, [subscriptions.length]);

  // 修复：在打开编辑模态框时初始化表单数据
  const handleEditProfile = () => {
    setEditForm({
      username: userData.username,
      bio: userData.bio,
      avatar: userData.avatar
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = () => {
    if (!editForm.username.trim()) {
      Alert.alert('错误', '用户名不能为空');
      return;
    }

    setUserData(prev => ({
      ...prev,
      username: editForm.username,
      bio: editForm.bio,
      avatar: editForm.avatar
    }));

    setShowEditProfileModal(false);
    Alert.alert('成功', '个人资料已更新');
  };

  // 通知相关函数
  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  // 个人主页组件
  const ProfileHeader = () => (
    <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleEditProfile}>
          <Image 
            source={{ uri: userData.avatar }} 
            style={styles.avatar}
          />
          <View style={[styles.editAvatarBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { color: colors.text }]}>{userData.username}</Text>
            <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userId, { color: colors.textSecondary }]}>ID: {userData.id}</Text>
          <Text style={[styles.userBio, { color: colors.textSecondary }]}>{userData.bio}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.levelText}>{userData.level}</Text>
        </View>
      </View>

      <View style={[styles.statsContainer, { borderTopColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{userData.following}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>关注</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{userData.followers}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>粉丝</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{userData.subscriptions}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>订阅</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{userData.listeningTime}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>收听时长</Text>
        </View>
      </View>
    </View>
  );

  // 最近收听组件
  const RecentListens = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>最近收听</Text>
        <TouchableOpacity onPress={() => setShowHistoryModal(true)}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>查看全部</Text>
        </TouchableOpacity>
      </View>
      {recentListens.map((item) => (
        <TouchableOpacity key={item.id} style={[styles.recentItem, { backgroundColor: colors.card }]}>
          <View style={styles.recentItemLeft}>
            <View style={[styles.recentIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="play-circle" size={20} color={colors.primary} />
            </View>
            <View style={styles.recentInfo}>
              <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.recentHost, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.host} · {item.duration}
              </Text>
            </View>
          </View>
          <Text style={[styles.recentTime, { color: colors.textSecondary }]}>{item.date}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 功能菜单项组件 - 移除收听历史
  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true, badge }) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.menuText}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  // 设置项组件
  const SettingItem = ({ title, description, value, onToggle, type = 'switch', onPress }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress || (() => {})}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
        )}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  // 修复：编辑资料模态框
  const EditProfileModal = () => (
    <Modal
      visible={showEditProfileModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditProfileModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>编辑资料</Text>
          <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.editForm}>
            {/* 头像编辑 */}
            <View style={styles.avatarEditSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>头像</Text>
              <TouchableOpacity style={styles.avatarEditContainer}>
                <Image 
                  source={{ uri: editForm.avatar }} 
                  style={styles.editAvatar}
                />
                <View style={[styles.changeAvatarButton, { backgroundColor: colors.primary }]}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.changeAvatarText}>更换</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 用户名编辑 - 修复：使用受控组件 */}
            <View style={styles.formGroup}>
              <Text style={[styles.editLabel, { color: colors.text }]}>用户名</Text>
              <TextInput
                style={[styles.textInput, { 
                  color: colors.text, 
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }]}
                value={editForm.username}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, username: text }))}
                placeholder="请输入用户名"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* 简介编辑 - 修复：使用受控组件 */}
            <View style={styles.formGroup}>
              <Text style={[styles.editLabel, { color: colors.text }]}>个人简介</Text>
              <TextInput
                style={[styles.textArea, { 
                  color: colors.text, 
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }]}
                value={editForm.bio}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                placeholder="介绍一下你自己..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                {editForm.bio.length}/100
              </Text>
            </View>

            {/* 保存按钮 */}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>保存修改</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // 通知模态框
  const NotificationsModal = () => (
    <Modal
      visible={showNotificationsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowNotificationsModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>我的通知</Text>
          <View style={styles.notificationHeaderActions}>
            {unreadNotifications > 0 && (
              <TouchableOpacity onPress={markAllNotificationsAsRead}>
                <Text style={[styles.markAllReadText, { color: colors.primary }]}>全部已读</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <View 
                key={notification.id} 
                style={[
                  styles.notificationItem, 
                  { 
                    backgroundColor: colors.card,
                    opacity: notification.read ? 0.7 : 1
                  }
                ]}
              >
                <View style={styles.notificationLeft}>
                  <View style={[
                    styles.notificationIcon, 
                    { backgroundColor: getNotificationColor(notification.type) }
                  ]}>
                    <Ionicons 
                      name={getNotificationIcon(notification.type)} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                      {notification.time}
                    </Text>
                  </View>
                </View>
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                  <TouchableOpacity 
                    onPress={() => deleteNotification(notification.id)}
                    style={styles.deleteNotificationButton}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyNotifications}>
              <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>暂无通知</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                当有新消息时会在这里显示
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  // 收听历史模态框
  const HistoryModal = () => (
    <Modal
      visible={showHistoryModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowHistoryModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>收听历史</Text>
          <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={listeningHistory}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.historyItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.historyItemLeft}>
                <View style={[styles.historyIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="play-circle" size={20} color={colors.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.historyHost, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.host} · {item.duration}
                  </Text>
                  <View style={styles.historyMeta}>
                    <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{item.date}</Text>
                    <Text style={[styles.historyProgress, { color: colors.primary }]}>{item.progress}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.historyListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );

  // 设置模态框 - 修复：添加主题设置入口
  const SettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>设置</Text>
          <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>播放设置</Text>
            <SettingItem
              title="自动播放"
              description="连续播放下一集节目"
              value={settings.autoPlay}
              onToggle={() => setSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
            />
            <SettingItem
              title="流量保护模式"
              description="在移动网络下降低音质"
              value={settings.dataSaver}
              onToggle={() => setSettings(prev => ({ ...prev, dataSaver: !prev.dataSaver }))}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>通知设置</Text>
            <SettingItem
              title="推送通知"
              description="接收新节目和活动通知"
              value={settings.notifications}
              onToggle={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>外观</Text>
            <SettingItem
              title="主题设置"
              description={isDark ? '深色模式' : '浅色模式'}
              type="navigation"
              onPress={() => {
                setShowSettingsModal(false);
                setTimeout(() => setShowThemeModal(true), 300);
              }}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>其他</Text>
            <SettingItem
              title="清除缓存"
              description="已使用 256MB 空间"
              type="navigation"
            />
            <SettingItem
              title="关于我们"
              description="版本 1.0.0"
              type="navigation"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // 主题模态框
  const ThemeModal = () => (
    <Modal
      visible={showThemeModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowThemeModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>选择主题</Text>
          <TouchableOpacity onPress={() => setShowThemeModal(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {themeOptions.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeOption,
                { 
                  backgroundColor: colors.card,
                  borderColor: (theme.id === 'light' && !isDark) || 
                              (theme.id === 'dark' && isDark) || 
                              theme.id === 'auto' ? colors.primary : colors.border
                }
              ]}
              onPress={() => handleThemeSelect(theme.id)}
            >
              <View style={styles.themeOptionLeft}>
                <View style={[styles.themeIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons 
                    name={theme.icon} 
                    size={20} 
                    color={colors.primary} 
                  />
                </View>
                <View>
                  <Text style={[styles.themeName, { color: colors.text }]}>{theme.name}</Text>
                  <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                    {theme.description}
                  </Text>
                </View>
              </View>
              {(theme.id === 'light' && !isDark) || 
               (theme.id === 'dark' && isDark) || 
               theme.id === 'auto' ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  // 创作中心模态框 - 保持不变
  const CreateCenterModal = () => (
    <Modal
      visible={showCreateCenterModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateCenterModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>创作中心</Text>
          <TouchableOpacity onPress={() => setShowCreateCenterModal(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyModalContent}>
          <Ionicons name="construct-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyModalTitle, { color: colors.text }]}>功能开发中</Text>
          <Text style={[styles.emptyModalDescription, { color: colors.textSecondary }]}>
            创作功能正在紧张开发中，敬请期待！
          </Text>
        </View>
      </View>
    </Modal>
  );

  // 辅助函数
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscription': return 'musical-notes';
      case 'system': return 'settings';
      case 'activity': return 'calendar';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'subscription': return '#4ECDC4';
      case 'system': return '#45B7D1';
      case 'activity': return '#FFD166';
      default: return colors.primary;
    }
  };

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    if (themeId === 'light' && isDark) {
      toggleTheme();
    } else if (themeId === 'dark' && !isDark) {
      toggleTheme();
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.guestContainer}>
          <Ionicons name="person-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.guestTitle, { color: colors.text }]}>访客模式</Text>
          <Text style={[styles.guestDescription, { color: colors.textSecondary }]}>
            登录后可以同步收藏、订阅和收听记录
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>立即登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader />
        <RecentListens />
        
        {/* 功能中心 - 移除收听历史 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>功能中心</Text>
          
          <MenuItem
            icon="rocket"
            title="创作中心"
            subtitle="发布和管理你的内容"
            onPress={() => setShowCreateCenterModal(true)}
          />
          
          <MenuItem
            icon="notifications"
            title="我的通知"
            subtitle={`${unreadNotifications}条未读消息`}
            badge={unreadNotifications > 0 ? unreadNotifications.toString() : null}
            onPress={() => setShowNotificationsModal(true)}
          />
          
          <MenuItem
            icon="settings"
            title="设置"
            subtitle="账号、外观和其他设置"
            onPress={() => setShowSettingsModal(true)}
          />
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>退出登录</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 模态框 */}
      <EditProfileModal />
      <NotificationsModal />
      <HistoryModal />
      <SettingsModal />
      <ThemeModal />
      <CreateCenterModal />
    </View>
  );
}

// 样式部分保持不变，与之前相同
// 样式部分保持不变...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  guestDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHeader: {
    padding: 20,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  userId: {
    fontSize: 14,
    marginBottom: 6,
  },
  userBio: {
    fontSize: 14,
    lineHeight: 18,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentHost: {
    fontSize: 12,
  },
  recentTime: {
    fontSize: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  editForm: {
    padding: 16,
  },
  avatarEditSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  avatarEditContainer: {
    alignItems: 'center',
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 12,
  },
});