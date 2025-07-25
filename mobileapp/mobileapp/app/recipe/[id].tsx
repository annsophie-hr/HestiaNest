import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Button, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useMealStore } from '@/store/mealStore'; // Correctly importing the store
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function RecipeDetailScreen() {
  const { id, returnTo, date } = useLocalSearchParams();
  const router = useRouter();
  // It's good practice to define a type for 'recipe' for better type safety.
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Planner state moved to main component

  const [planner, setPlanner] = useState<any[]>([]); // Added type for clarity
  const [servings, setServings] = useState('4'); // Keep servings as string for TextInput

  // Add these derived variables to check if recipe is already in planner
  const existingEntry = planner.find((item: any) => item.recipeId === id);
  const isAdded = Boolean(existingEntry);

  // Effect to fetch recipe details
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev';
    fetch(`${baseUrl}/recipes/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setRecipe(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching recipe:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Update servings when planner changes (if planner state is ever updated)
  useEffect(() => {
    const entry = planner.find((item: any) => item.recipeId === id);
    if (entry) {
      setServings(entry.servings.toString());
    }
  }, [planner, id]);


  const handleAddToPlanner = () => {
    const parsedServings = parseInt(servings, 10);
    if (isNaN(parsedServings) || parsedServings <= 0) {
      Alert.alert('Ungültige Portionen', 'Bitte geben Sie eine gültige Anzahl von Portionen ein.');
      return;
    }

    // Check if recipe data is available before proceeding
    if (!recipe) {
      Alert.alert('Fehler', 'Rezeptdaten sind nicht verfügbar.');
      return;
    }

    console.log("Checking returnTo and date:", { returnTo, date });
    if (returnTo === 'planner' && date) {
      const selectedDate = new Date(date as string);
      if (Platform.OS === 'web'){
        const confirmAdd = window.confirm(
          `Gericht hinzufügen: ${recipe.name} (${parsedServings} Portionen) zum ${selectedDate.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit'
          })} hinzufügen?`
        );
        if (confirmAdd) {
          console.log("Setting to meal store:", {
            id: recipe.id,
            servings: parsedServings,
            date: date as string,
            name: recipe.name
          });
          // Using the imported useMealStore
          useMealStore.getState().addPlannedMeal({
            id: recipe.id as string, // Ensure ID is string type as per MinimalRecipeInfo
            servings: parsedServings,
            date: date as string,
            name: recipe.name,
          });
          router.push('/(tabs)/planner');
        }
      }
      else {

      Alert.alert(
        'Gericht hinzufügen',
        `${recipe.name} (${parsedServings} Portionen) zum ${selectedDate.toLocaleDateString('de-DE', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit'
        })} hinzufügen?`,
        [
          {
            text: 'Abbrechen',
            style: 'cancel'
          },
          {
            text: 'Hinzufügen',
            onPress: () => {
              console.log("Setting to meal store:",{
                id: recipe.id,
                servings: parsedServings,
                date: date as string,
                name: recipe.name
              })
              // Using the imported useMealStore
              useMealStore.getState().addPlannedMeal({
                id: recipe.id as string, // Ensure ID is string type as per MinimalRecipeInfo
                servings: parsedServings,
                date: date as string,
                name: recipe.name,
              });
              router.push('/(tabs)/planner');
            }
          }
        ]
      );
    }
    } else {
      Alert.alert(
        'Datum wählen',
        'Bitte wählen Sie ein Datum aus dem Wochenplaner',
        [
          {
            text: 'Zum Planer',
            onPress: () => router.push('/(tabs)/planner')
          },
          {
            text: 'Abbrechen',
            style: 'cancel'
          }
        ]
      );
    }
  };


  const handleDelete = () => {
    Alert.alert(
      'Rezept löschen',
      'Bist du sicher, dass du dieses Rezept löschen möchtest?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev';
              const response = await fetch(`${baseUrl}/recipes/${id}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Erfolg', 'Rezept wurde gelöscht.');
                router.back();
              } else {
                const errorData = await response.json();
                Alert.alert('Fehler', errorData?.error || 'Löschen fehlgeschlagen.');
              }
            } catch (error: any) {
              console.error('Fehler beim Löschen:', error);
              Alert.alert('Fehler', 'Es gab ein Problem beim Löschen: ' + error.message);
            }
          },
        },
      ]
    );
  };

  // Conditional rendering for loading, error, and no recipe states
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  // Main component render
  return (
    <> 
      <Stack.Screen
        options=
        {{ title: recipe ? recipe.name: 'Recipe loading' }}
      />
  <SafeAreaView style={styles.container}edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.servingInfo}>
          Recipe serves: {recipe.servings} people
        </Text>

        {/* Conditionally render image if available */}
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          recipe.ingredients.map((ingredient: any, index: number) => (
            <Text key={index} style={styles.ingredient}>
              • {ingredient.amount} {ingredient.unit} {ingredient.name}
            </Text>
          ))
        ) : (
          <Text>No ingredients available</Text>
        )}

        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions && recipe.instructions.length > 0 ? (
          recipe.instructions.map((step: string, idx: number) => (
            <Text key={idx} style={styles.instruction}>
              {idx + 1}. {step}
            </Text>
          ))
        ) : (
          <Text>No instructions available</Text>
        )}

        {/* Add to Planner Section */}
        <View style={styles.plannerContainer}>
          <Text style={styles.sectionTitle}>Add to planner</Text>
          <View style={styles.plannerRow}>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={servings}
              onChangeText={setServings}
              placeholder="servings"
            />
            <TouchableOpacity
              style={[styles.button, isAdded ? styles.added : styles.notAdded]}
              onPress={handleAddToPlanner}
            >
              <Text style={styles.buttonText}>
                {isAdded ? `Update servings` : 'Add to planner'}
              </Text>
            </TouchableOpacity>
          </View>
          {isAdded && existingEntry && (
            <Text style={styles.plannerStatus}>
              ✓ Added to planer with {existingEntry.servings} servings
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push({ pathname: '/recipe/add-recipe', params: { id: id as string } })}
        >
          <Text style={styles.editButtonText}>Edit recipe</Text>
        </TouchableOpacity>

        <View style={styles.deleteButtonContainer}>
          <Button title="Delete recipe" onPress={handleDelete} color="red" fontSize="16" />
        </View>
      </ScrollView>
    </SafeAreaView> 
  </> // closing tag
  
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flex: 1
  },
  title: {
    fontSize: 33,
    fontFamily: 'DancingScript-Bold', // Uncomment if you have this font loaded
    marginBottom: 20,
    textAlign: 'center',
    color : '#696969',
  },
  servingInfo: {
    fontSize: 18,
    marginTop: 12,
    marginBottom: 6
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6
  },
  ingredient: {
    marginBottom: 4,
    fontSize: 16
  },
  instruction: {
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 22
  },
  error: {
    color: 'red',
    fontSize: 16
  },
  plannerContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  plannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    width: 80,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 5,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  added: {
    backgroundColor: '#75b090',
  },
  notAdded: {
    backgroundColor: '#75b090',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  plannerStatus: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#c6dde6',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  editButtonText: {
    fontWeight: 'bold'
  },
    deleteButtonText: {
    fontWeight: 'bold'
  },
  deleteButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
});