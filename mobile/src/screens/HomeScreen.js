import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text } from 'react-native';
import { useVideos } from '../hooks/useVideos';
import { VideoCard } from '../components/VideoCard';
import { useTheme } from '../contexts/ThemeContext';

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { data, isLoading, error, refetch } = useVideos();

  const handleVideoPress = (video) => {
    navigation.navigate('VideoDetail', { videoId: video._id });
  };

  const renderItem = ({ item }) => (
    <VideoCard video={item} onPress={() => handleVideoPress(item)} />
  );

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Error loading videos</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={data?.data || []}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});
