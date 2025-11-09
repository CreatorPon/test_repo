import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { searchContents } from '../store/slices/contentSlice';
import { Content } from '../types';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const CATEGORIES = [
  { id: 'all', label: 'すべて', icon: 'apps' },
  { id: 'cafe', label: 'カフェ', icon: 'cafe' },
  { id: 'restaurant', label: 'レストラン', icon: 'restaurant' },
  { id: 'sightseeing', label: '観光地', icon: 'airplane' },
  { id: 'shopping', label: 'ショッピング', icon: 'cart' },
];

const MapSearchScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { contents } = useAppSelector((state) => state.content);

  const [region, setRegion] = useState<Region>({
    latitude: 35.6812,
    longitude: 139.7671,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (user) {
      handleSearch();
    }
  }, [region, selectedCategory, user]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const handleSearch = async () => {
    if (!user) return;

    const radius = (region.latitudeDelta * 111) / 2; // kmに変換

    await dispatch(
      searchContents({
        userId: user.uid,
        filter: {
          location: {
            latitude: region.latitude,
            longitude: region.longitude,
            radius,
          },
          category: selectedCategory === 'all' ? undefined : selectedCategory,
        },
      })
    );
  };

  const filteredContents = contents.filter((content) => content.location);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {filteredContents.map((content) => (
          <Marker
            key={content.id}
            coordinate={{
              latitude: content.location!.lat,
              longitude: content.location!.lng,
            }}
            onPress={() => setSelectedContent(content)}
          >
            <View style={styles.markerContainer}>
              <Ionicons
                name={
                  content.contentType === 'sns_post'
                    ? 'share-social'
                    : content.contentType === 'web_page'
                    ? 'globe'
                    : 'image'
                }
                size={24}
                color="#007AFF"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedContent && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle} numberOfLines={1}>
              {selectedContent.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedContent(null)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedContent.description && (
            <Text style={styles.detailDescription} numberOfLines={2}>
              {selectedContent.description}
            </Text>
          )}

          <View style={styles.detailLocation}>
            <Ionicons name="location" size={16} color="#007AFF" />
            <Text style={styles.detailLocationText}>
              {selectedContent.location?.name}
            </Text>
          </View>

          {selectedContent.tags.length > 0 && (
            <View style={styles.detailTags}>
              {selectedContent.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.detailTag}>
                  <Text style={styles.detailTagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  categoryContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
  },
  categoryScroll: {
    paddingHorizontal: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  categoryTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  detailCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLocationText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  detailTagText: {
    fontSize: 12,
    color: '#007AFF',
  },
});

export default MapSearchScreen;
