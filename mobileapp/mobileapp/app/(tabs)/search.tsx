// app/search.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, TextInput, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router'; // For navigation to recipe details

import { ThemedText } from '@/components/ThemedText'; // Assuming you have these
import Header from '@/components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define a type for your recipe, similar to HomeScreen
interface Recipe {
  id: string;
  name: string;
  category: string;
  cooking_time?: number;
  tags?: string[]; // Assuming tags exist and are an array of strings
  // Add other properties of your recipe here as needed
}

export default function SearchScreen() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]); // To store all fetched recipes
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // To show loading state
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch all recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev/recipes');
        if (!res.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data: Recipe[] = await res.json();
        setAllRecipes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // 2. Filter recipes based on search query (memoized for performance)
  const filteredRecipes = useMemo(() => {
    if (!searchQuery) {
      return []; // Return empty array if search query is empty (clean state)
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    return allRecipes.filter(recipe => {
      const nameMatch = recipe.name.toLowerCase().includes(lowercasedQuery);
      const categoryMatch = recipe.category.toLowerCase().includes(lowercasedQuery);
      const tagMatch = recipe.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery));

      return nameMatch || categoryMatch || tagMatch;
    });
  }, [allRecipes, searchQuery]);

  // Handle navigation to individual recipe details
  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

    return (
    <SafeAreaView style={styles.container}>
      <View>
        <Header title="Search Recipes" />
        {error && <Text style={styles.error}>Error: {error}</Text>}
      </View>

      <ScrollView style={styles.contentContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name, category, or tag..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Display loading, error, or results */}
        {isLoading && <ThemedText style={styles.statusText}>Loading recipes...</ThemedText>}
        {error && <ThemedText style={styles.error}>Error: {error}</ThemedText>}

        {/* Display results only if query is not empty, not loading, and no error */}
        {!isLoading && !error && searchQuery.length > 0 && (
          <View style={styles.resultsContainer}>
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeListItem}
                  onPress={() => handleRecipePress(recipe.id)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.recipeListName}>{recipe.name}</ThemedText>
                  {recipe.category && (
                    <ThemedText style={styles.recipeListCategory}>Category: {recipe.category}</ThemedText>
                  )}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <ThemedText style={styles.recipeListTags}>Tags: {recipe.tags.join(', ')}</ThemedText>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <ThemedText style={styles.noResultsText}>No recipes found for "{searchQuery}"</ThemedText>
            )}
          </View>
        )}

        {/* Optional: Add a message if search bar is empty and not loading */}
        {!isLoading && !error && searchQuery.length === 0 && (
          <ThemedText style={styles.statusText}>Start typing to find recipes.</ThemedText>
        )}
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
  
  searchBar: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    marginBottom: 20,
    elevation: 3,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  resultsContainer: {
    flex: 1, // Take up remaining space
    marginTop: 10,
  },
  recipeListItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF', // A subtle accent color

  },
  recipeListName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  recipeListCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  recipeListTags: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});