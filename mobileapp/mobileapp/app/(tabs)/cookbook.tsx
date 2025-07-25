import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect, useRouter, useLocalSearchParams  } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddRecipeButton from '@/components/AddRecipeButton'; 
import { ThemedView } from '@/components/ThemedView';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '@/components/Header';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();//this gets incoming parameters
  const incomingReturnTo = params.returnTo;
  const incomingDate = params.date;
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 

  // Define the fetch function
  const fetchRecipes = async () => {
    setLoading(true); // Start loading
    try {
      const res = await fetch('https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev/recipes');
      if (!res.ok) {
        throw new Error(`Failed to fetch recipes: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Fetched recipes:', data); // Debug log
      console.log('*** RAW DATA FETCHED FROM API: ***');
      console.log(JSON.stringify(data, null, 2)); // Use stringify for readability of JSON objects
      console.log('**********************************');

      setRecipes(data);
      setError(null); // Clear any previous errors
    } catch (err: any) { // Type 'any' for error for now, or refine to Error
      console.error('Error fetching recipes:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false); // End loading
    }
  };

  // Use useFocusEffect to call fetchRecipes whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchRecipes(); // Call the fetch function

      // Optional: return a cleanup function if you had any subscriptions or timers
      return () => {
        // For simple fetches, no specific cleanup is usually needed here.
      };
    }, []) // Empty dependency array means this effect runs once on mount AND every time the screen focuses
  );


  const groupedRecipes = recipes.reduce((acc: Record<string, any[]>, recipe: any) => {
  const category = recipe.category || 'Other';
  if (!acc[category]) acc[category] = [];
  acc[category].push(recipe);
  return acc;
}, {} as Record<string, any[]>);

  // Function to handle recipe tile press: needs to hand over ReturnTo/Date
  const handleRecipePress = (recipeId: string) => {
    router.push({
      pathname: `/recipe/${recipeId}`,
      params: {
        returnTo: incomingReturnTo || '/cookbook',
        date: incomingDate || new Date().toISOString().split('T')[0], // Default to today if no date provided
      },
  });
  }

 

  return (
    <SafeAreaView style={styles.container}>
    {/* Header with title */}
    <View>
      <Header title="Browse Recipes"/>
      {error && <Text style={styles.error}>Error: {error}</Text>}
    </View>

    <ScrollView style={styles.contentContainer}>
      {Object.entries(groupedRecipes).map(([category, items]: [string, any[]]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>

          <View style={styles.tilesContainer}>
            {items.slice(0, 6).map(recipe => (
              <TouchableOpacity 
                key={recipe.id} 
                style={styles.recipeTile}
                onPress={() => handleRecipePress(recipe.id)}
                activeOpacity={0.8}
              >
                {/* Recipe tile with image placeholder */}
                <View style={styles.tileImage}>
                  {recipe.image_url ? (
                    <Image
                      source={{ uri: recipe.image_url }}
                      style={styles.image}
                    />
                        ) : (
                          <Text style ={styles.tileImageText}></Text>
                        )}
                </View>
                <Text style={styles.tileName} numberOfLines={2}>
                  {recipe.name}
                </Text>
                <Text style={styles.tileTime}>
                  {(recipe.preparation_time && recipe.cooking_time) 
                  ? `${recipe.preparation_time + recipe.cooking_time} min` 
                  : `${recipe.preparation_time} min`}
                </Text>
              </TouchableOpacity>
            ))}
          </View> 
          
          {/* Show "View More" if there are more than 6 recipes */}
          {items.length > 6 && (
            <TouchableOpacity 
              onPress={() => router.push(`/category/${category}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewMoreText}>
                View {items.length - 6} more recipes...
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}  

      <ThemedView style={styles.stepContainer}>
        <AddRecipeButton onPress={() => router.push('/recipe/add-recipe')} />
      </ThemedView>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Adjust for Android status bar
    paddingBottom: 20, // Add some padding at the bottom
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginTop: 16
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 4,
    color: '#484848',
  },
  recipeName: {
    fontSize: 16,
    marginLeft: 10,
  },
categorySection: {
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    
  },
 
  error: {
    color: 'red',
    fontSize: 16,
  },
    // Tile layout styles
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  recipeTile: {
    width: '48%',  // 2 tiles per row with some spacing
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',

    // Add subtle hover effect styling
    transform: [{ scale: 1 }],
  },
  
  tileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
    image: {
    width: 120,
    height: 60,
    marginBottom: 12,
    borderRadius: 8
  },
  
  tileImageText: {
    fontSize: 24,
  },
  
  tileName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  
  tileTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  viewMoreText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
});