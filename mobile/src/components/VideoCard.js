import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const VideoCard = ({ video, onPress }) => {
  const { theme } = useTheme();

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.card }]} 
      onPress={onPress}
    >
      <View style={styles.thumbnailContainer}>
        {video.thumbnail ? (
          <Image 
            source={{ uri: video.thumbnail }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
              No Thumbnail
            </Text>
          </View>
        )}
        {video.duration > 0 && (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text 
          style={[styles.title, { color: theme.colors.text }]} 
          numberOfLines={2}
        >
          {video.title}
        </Text>
        {video.speaker && (
          <Text 
            style={[styles.speaker, { color: theme.colors.textSecondary }]} 
            numberOfLines={1}
          >
            {video.speaker}
          </Text>
        )}
        <Text style={[styles.views, { color: theme.colors.textSecondary }]}>
          {video.views || 0} views
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  speaker: {
    fontSize: 12,
    marginBottom: 4,
  },
  views: {
    fontSize: 11,
  },
});
