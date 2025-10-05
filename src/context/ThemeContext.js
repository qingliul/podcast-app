// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // 从存储加载主题设置
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@app_theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('加载主题设置失败:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('@app_theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };

  const theme = {
    isDark,
    colors: isDark ? {
      // 深色主题
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#AAAAAA',
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      border: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      overlay: 'rgba(0,0,0,0.7)',
      gradientStart: '#2C3E50',
      gradientEnd: '#4A235A',
    } : {
      // 浅色主题
      background: '#FFFFFF',
      card: '#F8F9FA',
      text: '#2D3436',
      textSecondary: '#636E72',
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      border: '#DFE6E9',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      overlay: 'rgba(255,255,255,0.9)',
      gradientStart: '#74B9FF',
      gradientEnd: '#0984E3',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    typography: {
      title: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      subtitle: {
        fontSize: 18,
        fontWeight: '600',
      },
      body: {
        fontSize: 16,
        fontWeight: '400',
      },
      caption: {
        fontSize: 14,
        fontWeight: '400',
      },
    },
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};