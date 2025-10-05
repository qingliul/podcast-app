// App.js
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { CommentsProvider } from './src/context/CommentsContext';
import MainTab from './src/navigation/MainTab';
import MiniPlayer from './src/components/MiniPlayer';
import PlaylistModal from './src/components/PlaylistModal';

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <SubscriptionProvider>
          <FavoritesProvider>
            <CommentsProvider>
              <NavigationContainer>
                <View style={{ flex: 1 }}>
                  <MainTab />
                  <MiniPlayer />
                  <PlaylistModal />
                </View>
              </NavigationContainer>
            </CommentsProvider>
          </FavoritesProvider>
        </SubscriptionProvider>
      </PlayerProvider>
    </ThemeProvider>
  );
}