// src/navigation/MainTab.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// 导入屏幕
import ProfileScreen from '../screens/ProfileScreen';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlayerScreen from '../screens/PlayerScreen';
import CommentsScreen from '../screens/CommentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 发现堆栈
function DiscoveryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DiscoveryMain" component={DiscoveryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
    </Stack.Navigator>
  );
}

// 订阅堆栈
function SubscriptionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SubscriptionsMain" component={SubscriptionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
    </Stack.Navigator>
  );
}

// 收藏堆栈
function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FavoritesMain" component={FavoritesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
    </Stack.Navigator>
  );
}

// 个人堆栈
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
    </Stack.Navigator>
  );
}

export default function MainTab() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '发现') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === '订阅') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === '收藏') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === '我的') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="发现" component={DiscoveryStack} />
      <Tab.Screen name="订阅" component={SubscriptionsStack} />
      <Tab.Screen name="收藏" component={FavoritesStack} />
      <Tab.Screen name="我的" component={ProfileStack} />
    </Tab.Navigator>
  );
}