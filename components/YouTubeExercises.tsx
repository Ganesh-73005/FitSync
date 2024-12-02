import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  videoId: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const exercises: Exercise[] = [
  {
    id: "1",
    videoId: "zkU6Ok44_CI",
    title: "Perfect Push-Up Form",
    description: "Master the perfect push-up technique for upper body strength",
    category: "Upper Body",
    duration: "5 min",
    difficulty: "Beginner",
  },
  {
    id: "2",
    videoId: "HFnSsLIB7a4",
    title: "Squat Fundamentals",
    description: "Learn proper squat form for lower body strength",
    category: "Lower Body",
    duration: "8 min",
    difficulty: "Beginner",
  },
  {
    id: "3",
    videoId: "dJlFmxiL11s",
    title: "Core Workout",
    description: "Strengthen your core with these effective exercises",
    category: "Core",
    duration: "10 min",
    difficulty: "Intermediate",
  },
  {
    id: "4",
    videoId: "bdCX8Nb_2Mg",
    title: "HIIT Cardio",
    description: "High-intensity interval training for maximum calorie burn",
    category: "Cardio",
    duration: "15 min",
    difficulty: "Advanced",
  },
  {
    id: "5",
    videoId: "0JfYxMRsUCQ",
    title: "Shoulder Press",
    description: "Build shoulder strength and stability",
    category: "Upper Body",
    duration: "7 min",
    difficulty: "Intermediate",
  },
  {
    id: "6",
    videoId: "XxWcirHIwVo",
    title: "Deadlift Basics",
    description: "Master the deadlift for full-body strength",
    category: "Lower Body",
    duration: "12 min",
    difficulty: "Advanced",
  },
];

export default function ExerciseApp() {
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredExercises = exercises.filter((exercise) =>
    filter === "all" ? true : exercise.category.toLowerCase() === filter.toLowerCase()
  );

  const renderExerciseCard = (exercise: Exercise) => {
   
    const badgeColor = getBadgeColor(exercise.difficulty);

    return (
      <Animated.View
        key={exercise.id}
        style={[styles.card, { opacity: fadeAnim }]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => setSelectedVideo(exercise)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: `https://img.youtube.com/vi/${exercise.videoId}/maxresdefault.jpg` }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{exercise.title}</Text>
            <Text style={styles.cardDescription}>{exercise.description}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.badge, badgeColor]}>
                <Text style={styles.badgeText}>{exercise.difficulty}</Text>
              </View>
              <Text style={styles.duration}>{exercise.duration}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Fitness Exercises</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filter}
            onValueChange={(itemValue) => setFilter(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="All Categories" value="all" />
            <Picker.Item label="Upper Body" value="upper body" />
            <Picker.Item label="Lower Body" value="lower body" />
            <Picker.Item label="Core" value="core" />
            <Picker.Item label="Cardio" value="cardio" />
          </Picker>
        </View>

        {selectedVideo && (
          <View style={styles.videoContainer}>
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${selectedVideo.videoId}` }}
              style={styles.video}
              allowsFullscreenVideo
              javaScriptEnabled
            />
            <Text style={styles.videoTitle}>{selectedVideo.title}</Text>
            <Text style={styles.videoDescription}>{selectedVideo.description}</Text>
          </View>
        )}

        <View style={styles.exerciseGrid}>
          {filteredExercises.map(renderExerciseCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getBadgeColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return { backgroundColor: '#4CAF50' };
    case 'Intermediate':
      return { backgroundColor: '#FFA726' };
    case 'Advanced':
      return { backgroundColor: '#F44336' };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 30
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  picker: {
    height: 50,
    width: '100%',
  },
  videoContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  video: {
    width: '100%',
    height: 200,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  videoDescription: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    color: '#666',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: width > 600 ? '48%' : '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContent: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  cardInfo: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
});
