import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface FoodItem {
  bmiCategory: string
  bmiRange: string
  mealType: string
  foodsList: string
  caloriesPerServing: number
  proteinContent: number
  nutritionInfo: string
  monthsToFollow: number
}

export default function FoodChart() {
  const [foodChart, setFoodChart] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Animation values
  const fadeAnim = new Animated.Value(0)
  const translateY = new Animated.Value(50)

  useEffect(() => {
    fetchFoodChart()
    startEntryAnimation()
  }, [])

  const startEntryAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const fetchFoodChart = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://10.11.146.131:8080/food-chart')
      console.log(response.status)
      const data = await response.json()
      
      setFoodChart(data)
      setError(null)
    } catch (error) {
      setError('Failed to fetch food chart data. Please try again.'+ error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchFoodChart()
  }

  const renderProgressBar = (value: number, max: number) => {
    const percentage = (value / max) * 100
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>
    )
  }

  const renderFoodItem = ({ item, index }: { item: FoodItem; index: number }) => {
    const itemAnimation = new Animated.Value(0)

    Animated.timing(itemAnimation, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start()

    return (
      <Animated.View
        style={[
          styles.foodItem,
          {
            opacity: itemAnimation,
            transform: [
              {
                translateY: itemAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.category}>{item.bmiCategory}</Text>
          <Text style={styles.bmiRange}>{item.bmiRange}</Text>
        </View>
        
        <Text style={styles.mealType}>{item.mealType}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Foods</Text>
          <Text style={styles.foodsList}>{item.foodsList}</Text>
        </View>

        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          
          <View style={styles.nutritionItem}>
            <View style={styles.nutritionHeader}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>{item.caloriesPerServing} kcal</Text>
            </View>
            {renderProgressBar(item.caloriesPerServing, 2500)}
          </View>

          <View style={styles.nutritionItem}>
            <View style={styles.nutritionHeader}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>{item.proteinContent}g</Text>
            </View>
            {renderProgressBar(item.proteinContent, 50)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Nutrients</Text>
          <Text style={styles.nutritionInfo}>{item.nutritionInfo}</Text>
        </View>

        <View style={styles.durationContainer}>
          <Text style={styles.duration}>
            Follow for {item.monthsToFollow} months
          </Text>
        </View>
      </Animated.View>
    )
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading your food chart...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFoodChart}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={styles.title}>Food Chart</Text>
        <Text style={styles.subtitle}>Your personalized nutrition guide</Text>
      </Animated.View>

      <FlatList
        data={foodChart}
        renderItem={renderFoodItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  bmiRange: {
    fontSize: 14,
    color: '#666',
  },
  mealType: {
    fontSize: 16,
    color: '#0066cc',
    marginBottom: 12,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  foodsList: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  nutritionSection: {
    marginVertical: 12,
  },
  nutritionItem: {
    marginVertical: 6,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
  },
  nutritionValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  nutritionInfo: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  durationContainer: {
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  duration: {
    fontSize: 14,
    color: '#0066cc',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
})

