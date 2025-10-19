import React from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useVideo } from '../hooks/useVideos';
import { VideoPlayer } from '../components/VideoPlayer';
import { useTheme } from '../contexts/ThemeContext';

export const VideoDetailScreen = ({ route }) => {
  const { videoId } = route.params;
  const { theme } = useTheme();
  const { data, isLoading, error } = useVideo(videoId);

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !data?.data) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Error loading video</Text>
      </View>
    );
  }

  const video = data.data;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <VideoPlayer videoUrl={video.url} thumbnailUrl={video.thumbnail} />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {video.title}
        </Text>
        
        {video.speaker && (
          <Text style={[styles.speaker, { color: theme.colors.textSecondary }]}>
            Speaker: {video.speaker}
          </Text>
        )}
        
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {video.views || 0} views
          </Text>
          {video.category && (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              • {video.category}
            </Text>
          )}
        </View>
        
        {video.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {video.description}
            </Text>
          </View>
        )}
        
        {video.tags && video.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {video.tags.map((tag, index) => (
              <View 
                key={index} 
                style={[styles.tag, { backgroundColor: theme.colors.surface }]}
              >
                <Text style={[styles.tagText, { color: theme.colors.text }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  speaker: {
    fontSize: 16,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    marginRight: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
  },
});
