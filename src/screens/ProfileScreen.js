// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Modal,
  StatusBar
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateCenterModal, setShowCreateCenterModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(isDark ? 'dark' : 'light'); // 添加这行

  // 模拟用户数据
  const [userData, setUserData] = useState({
    id: '123456',
    username: '播客爱好者',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    following: 45,
    followers: 128,
    subscriptions: 23,
    listeningTime: '156小时',
    level: 'Lv.12',
    bio: '热爱生活，喜欢听播客的普通人'
  });

  // 模拟最近收听
  const [recentListens] = useState([
    { id: '1', title: '科技早知道', host: '科技频道', time: '2小时前', duration: '45分钟' },
    { id: '2', title: '深夜读书会', host: '文学电台', time: '昨天', duration: '30分钟' },
    { id: '3', title: '商业思维', host: '商业洞察', time: '2天前', duration: '50分钟' },
    { id: '4', title: '心理健康指南', host: '心理专家', time: '3天前', duration: '25分钟' }
  ]);

  // 收听历史
  const [listeningHistory] = useState([
    { id: '1', title: '科技早知道', host: '科技频道', date: '2024-01-15', duration: '45分钟', progress: '100%' },
    { id: '2', title: '深夜读书会', host: '文学电台', date: '2024-01-14', duration: '30分钟', progress: '80%' },
    { id: '3', title: '商业思维', host: '商业洞察', date: '2024-01-13', duration: '50分钟', progress: '60%' },
    { id: '4', title: '心理健康指南', host: '心理专家', date: '2024-01-12', duration: '25分钟', progress: '100%' },
    { id: '5', title: '历史那些事', host: '历史研究会', date: '2024-01-11', duration: '40分钟', progress: '45%' }
  ]);

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

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    if (themeId === 'light' && isDark) {
      toggleTheme();
    } else if (themeId === 'dark' && !isDark) {
      toggleTheme();
    }
    // 对于 auto 模式，这里可以添加系统主题监听逻辑
  };

  const handleSettingToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // 个人主页组件
  const ProfileHeader = () => (
    <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
      <View style={styles.avatarSection}>
        <Image 
          source={{ uri: userData.avatar }} 
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>{userData.username}</Text>
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
          <Text style={[styles.recentTime, { color: colors.textSecondary }]}>{item.time}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 功能菜单项组件
  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
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
      {showArrow && (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  // 设置项组件
  const SettingItem = ({ title, description, value, onToggle, type = 'switch' }) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
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
    </View>
  );

  // 主题选择模态框
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
        
        <ScrollView style={styles.modalContent}>
          {listeningHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
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
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  // 设置模态框
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
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>账号与安全</Text>
            <SettingItem
              title="修改密码"
              description="定期更改密码保护账号安全"
              type="navigation"
              onToggle={() => {}}
            />
            <SettingItem
              title="绑定手机"
              description="已绑定：138****1234"
              type="navigation"
              onToggle={() => {}}
            />
            <SettingItem
              title="隐私设置"
              description="管理个人信息的可见性"
              type="navigation"
              onToggle={() => {}}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>播放设置</Text>
            <SettingItem
              title="自动播放"
              description="连续播放下一集节目"
              value={settings.autoPlay}
              onToggle={() => handleSettingToggle('autoPlay')}
            />
            <SettingItem
              title="流量保护模式"
              description="在移动网络下降低音质"
              value={settings.dataSaver}
              onToggle={() => handleSettingToggle('dataSaver')}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>通知设置</Text>
            <SettingItem
              title="推送通知"
              description="接收新节目和活动通知"
              value={settings.notifications}
              onToggle={() => handleSettingToggle('notifications')}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>外观</Text>
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowSettingsModal(false);
                setTimeout(() => setShowThemeModal(true), 300);
              }}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>主题设置</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {isDark ? '深色模式' : '浅色模式'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>其他</Text>
            <SettingItem
              title="清除缓存"
              description="已使用 256MB 空间"
              type="navigation"
              onToggle={() => {}}
            />
            <SettingItem
              title="关于我们"
              description="版本 1.0.0"
              type="navigation"
              onToggle={() => {}}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // 空状态模态框（用于创作中心和通知）
  const EmptyModal = ({ visible, onClose, title, description }) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyModalContent}>
          <Ionicons name="construct-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyModalTitle, { color: colors.text }]}>功能开发中</Text>
          <Text style={[styles.emptyModalDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
    </Modal>
  );

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
        {/* 个人主页头部 */}
        <ProfileHeader />
        
        {/* 最近收听 */}
        <RecentListens />
        
        {/* 功能菜单 */}
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
            subtitle="2条未读消息"
            onPress={() => setShowNotificationsModal(true)}
          />
          
          <MenuItem
            icon="time"
            title="收听历史"
            subtitle="查看所有收听记录"
            onPress={() => setShowHistoryModal(true)}
          />
          
          <MenuItem
            icon="settings"
            title="设置"
            subtitle="账号、外观和其他设置"
            onPress={() => setShowSettingsModal(true)}
          />
        </View>

        {/* 退出登录 */}
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
      <ThemeModal />
      <HistoryModal />
      <SettingsModal />
      <EmptyModal
        visible={showCreateCenterModal}
        onClose={() => setShowCreateCenterModal(false)}
        title="创作中心"
        description="创作功能正在紧张开发中，敬请期待！"
      />
      <EmptyModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="我的通知"
        description="通知系统正在升级优化，很快就能和大家见面！"
      />
    </View>
  );
}

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
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
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
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyHost: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 11,
  },
  historyProgress: {
    fontSize: 11,
    fontWeight: '600',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  emptyModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyModalDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});