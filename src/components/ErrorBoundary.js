// src/components/ErrorBoundary.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.log('错误详情:', error);
    console.log('错误信息:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>😵 出现错误</Text>
          <Text style={styles.errorText}>
            {this.state.error ? this.state.error.toString() : '未知错误'}
          </Text>
          <Text style={styles.infoText}>组件堆栈:</Text>
          <Text style={styles.stackText}>
            {this.state.errorInfo?.componentStack || '无堆栈信息'}
          </Text>
          <Text style={styles.reloadText}>
            请重启应用或联系开发者
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#dc3545',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6c757d',
  },
  stackText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  reloadText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});