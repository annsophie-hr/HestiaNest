import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useMealStore, MinimalRecipeInfo } from '@/store/mealStore'; // Import MinimalRecipeInfo
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { SafeAreaInsetsContext, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // IMPORT useSafeAreaInsets
import { Platform } from 'react-native';

export default function MealPlannerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets(); // Get safe area insets here

    // console.log('Safe area insets:', insets); // Debug log to check insets
    // console.log('Bottom Inset: ', insets.bottom); // Log bottom inset specifically
        // Get the Zustand store's state and actions

    // Get plannedMeals state and the store actions directly from Zustand
    const plannedMeals = useMealStore((state) => state.plannedMeals);
    // Get the actions (functions) from the store
    const addPlannedMeal = useMealStore((state) => state.addPlannedMeal);
    const removePlannedMeal = useMealStore((state) => state.removePlannedMeal);
    const clear = useMealStore((state) => state.clear); // Keep clear for addedRecipe

    const TAB_BAR_HEIGHT = 60;
    const ACTUAL_BUTTON_HEIGHT = 40;
    const BOTTOM_ACTIONS_CONTAINER_PADDING_TOP = 5
    const BOTTOM_ACTIONS_CONTAINER_DYNAMIC_BOTTOM_PADDING_ADJUSTMENT = 5; // The '5' you added here

    // So, the total visual height of the `bottomActions` bar itself will be:
    const ACTUAL_BOTTOM_BAR_VISUAL_HEIGHT =
        ACTUAL_BUTTON_HEIGHT +
        BOTTOM_ACTIONS_CONTAINER_PADDING_TOP +
        BOTTOM_ACTIONS_CONTAINER_DYNAMIC_BOTTOM_PADDING_ADJUSTMENT + // This '5' from paddingBottom
        insets.bottom; // This `insets.bottom` is accounted for by the `paddingBottom` of `bottomActions`
    
    
    // console.log('ACTUAL_BOTTOM_BAR_VISUAL_HEIGHT:', ACTUAL_BOTTOM_BAR_VISUAL_HEIGHT);

    const SCROLL_CONTENT_MIN_BUFFER_ABOVE_BOTTOM_BAR = 15;
    const finetune = -50;

    const getCurrentWeek = useCallback(() => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);

        const week = [];
        for (let i = 0; i < 5; i++) { // For Monday to Friday
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            week.push(day);
        }
        return week;
    }, []);

    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
    const [loading, setLoading] = useState(false);
    const [persons, setPersons] = useState(4); // Default serving size


    const formatDate = useCallback((date: Date) => {
        return date.toLocaleDateString('en-EN', {
            day: '2-digit',
            month: '2-digit'
        });
    }, []);

    const getDayName = useCallback((date: Date) => {
        return date.toLocaleDateString('en-EN', { weekday: 'long' });
    }, []);

    const getWeekRange = useCallback(() => {
        const start = currentWeek[0];
        const end = currentWeek[4];
        return `${formatDate(start)} - ${formatDate(end)}`;
    }, [currentWeek, formatDate]);

    const handleAddMeal = useCallback((date: Date) => {
        const dateParam = date.toISOString();
        router.push(`/(tabs)/cookbook?returnTo=planner&date=${dateParam}`);
    }, [router]);


    // This function now gets meals directly from the Zustand store's `plannedMeals`
    const getMealsForDate = useCallback((date: Date): MinimalRecipeInfo[] => {
        const dateKey = date.toISOString().split('T')[0];
        return plannedMeals[dateKey] || []; // Access directly from Zustand state
    }, [plannedMeals]); // Dependency on plannedMeals from Zustand


    // This function will now call the Zustand store's removePlannedMeal action
    const removeMealFromDay = useCallback((date: Date, mealIdToRemove: string) => {
        const dateKey = date.toISOString().split('T')[0];
        Alert.alert(
            'Mahlzeit entfernen',
            'Bist du sicher, dass du diese Mahlzeit entfernen möchtest?',
            [
                { text: 'Abbrechen', style: 'cancel' },
                {
                    text: 'Entfernen',
                    style: 'destructive',
                    onPress: () => removePlannedMeal(dateKey, mealIdToRemove), // Call Zustand action
                },
            ]
        );
    }, [removePlannedMeal]);


    const handleGenerateShoppingList = useCallback(async () => {
        try {
            setLoading(true);

            const mealsToProcess = [];
            Object.values(plannedMeals).forEach(dayMeals => { // Use plannedMeals from Zustand
                dayMeals.forEach(meal => {
                    mealsToProcess.push({
                        recipe_id: parseInt(meal.id),
                        target_persons: meal.servings
                    }); 
                });
            }); 

            // The rest of your function follows here
            if (mealsToProcess.length === 0) {
                Alert.alert('Hinweis', 'Keine Gerichte in der Wochenplanung gefunden.');
                setLoading(false);
                return;
            }

            const requestBody = JSON.stringify({ meals: mealsToProcess });

            //console.log("Frontend sending payload:", requestBody);

            const response = await fetch('https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev/shopping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //'x-api-key': '1302'
                },
                body: JSON.stringify({
                    recipes: mealsToProcess,
                    persons: persons
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            router.push({
                pathname: '/recipe/shopping-list',
                params: {
                    shoppingList: JSON.stringify(data.shopping_list),
                    weekRange: getWeekRange()
                }
            });

        } catch (error: any) { // Add type any to error
            console.error('Error generating shopping list:', error);
            Alert.alert('Fehler', `Fehler beim Erstellen der Einkaufsliste: ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    }, [plannedMeals, router, getWeekRange, persons]); // Added persons to dependencies

    const handleEmailShoppingList = useCallback(async () => {
        console.log("Sending shopping list via email...");
        
        const sendEmailWithAddress = async (email: string) => {
            if (!email || email.trim() === '') {
                Alert.alert('Fehler', 'E-Mail Adresse ist erforderlich.');
                return;
            }
            
            try {
                console.log("Preparing to send email with shopping list...");
                setLoading(true);
                
                const mealsToProcess = [];
                Object.values(plannedMeals).forEach(dayMeals => {
                    dayMeals.forEach(meal => {
                        mealsToProcess.push({
                            recipe_id: parseInt(meal.id),
                            target_persons: meal.servings
                        });
                    });
                });
                
                if (mealsToProcess.length === 0) {
                    Alert.alert('Hinweis', 'Keine Gerichte in der Wochenplanung gefunden.');
                    return;
                }
                
                const response = await fetch('https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev/shopping', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        recipes: mealsToProcess,
                        persons: persons,
                        email: email.trim()
                    })
                });
                
                if (response.ok) {
                    Alert.alert('Erfolg', 'Einkaufsliste wurde per E-Mail gesendet!');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to send email');
                }
            } catch (error: any) { // Add type any to error
                console.error('Error sending email:', error);
                Alert.alert('Fehler', `E-Mail konnte nicht gesendet werden: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        
        // Use Alert.prompt for iOS (works better in Expo Go than the previous implementation)
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'Einkaufsliste per E-Mail senden',
                'Geben Sie Ihre E-Mail Adresse ein:',
                [
                    {
                        text: 'Abbrechen',
                        style: 'cancel',
                    },
                    {
                        text: 'Senden',
                        onPress: (email) => {
                            if (email) {
                                sendEmailWithAddress(email);
                            }
                        },
                    },
                ],
                'plain-text',
                '',
                'email-address' // This sets the keyboard type to email
            );
        } else {
            // For Android or web
            Alert.prompt(
                'Einkaufsliste per E-Mail senden',
                'Geben Sie Ihre E-Mail Adresse ein:',
                [
                    {
                        text: 'Abbrechen',
                        style: 'cancel',
                    },
                    {
                        text: 'Senden',
                        onPress: (email) => {
                            if (email) {
                                sendEmailWithAddress(email);
                            }
                        },
                    },
                ],
                'plain-text'
            );
        }
    }, [plannedMeals, persons]);


    // Handle navigation back from cookbook and process added recipe from store
    useEffect(() => {
        // Get the *last* added recipe from the store (this is still how RecipeDetailScreen sets it)
        const { addedRecipe, clear } = useMealStore.getState(); // Get current state directly

        if (addedRecipe) {
            console.log("Recipe found in store (in Planner useEffect):", addedRecipe);
            // Add this recipe to the main plannedMeals state in Zustand
            addPlannedMeal(addedRecipe); // Call the Zustand action
            clear(); // Clear the addedRecipe from the store after processing it
        }
    }, [addPlannedMeal, clear]); // Dependencies are crucial!

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ width: '100%' }}>
                <Header title="Weekly Planner"/>
            </View>

            {/* Weekly Planner */}
            <ScrollView
                style={styles.scrollContentContainer}
                // Apply padding to contentContainerStyle to make space for bottom actions
                contentContainerStyle={{
                    paddingBottom: 
                        TAB_BAR_HEIGHT + 
                        ACTUAL_BOTTOM_BAR_VISUAL_HEIGHT + 
                        SCROLL_CONTENT_MIN_BUFFER_ABOVE_BOTTOM_BAR }} // Add extra padding for the buttons + safe area
            >
                <Text style={styles.weekRange}>week: {getWeekRange()}</Text>
                {currentWeek.map((date, index) => {
                    const meals = getMealsForDate(date);

                    return (
                        <View key={index} style={styles.dayContainer}>
                            <View style={styles.dayHeader}>
                                <View style={styles.dayInfo}>
                                    <Text style={styles.dayName}>{getDayName(date)}</Text>
                                    <Text style={styles.dayDate}>{formatDate(date)}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => handleAddMeal(date)}
                                >
                                    <Text style={styles.addButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Planned Meals */}
                            <View style={styles.mealsContainer}>
                                {meals.length > 0 ? (
                                    meals.map((meal, mealIndex) => (
                                        <View key={mealIndex} style={styles.mealItem}>
                                            <View style={styles.mealInfo}>
                                                <Text style={styles.mealName}>{meal.name}</Text>
                                                <Text style={styles.mealServings}>{meal.servings} Portionen</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.removeMealButton}
                                                onPress={() => removeMealFromDay(date, meal.id)}
                                            >
                                                <Text style={styles.removeMealText}>×</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noMealsText}>No meals planned</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Bottom Actions - Now explicitly positioned and given bottom padding */}
            <View style={[
                styles.bottomActions, 
                { 
                    bottom: insets.bottom + TAB_BAR_HEIGHT + finetune,
                    paddingBottom: insets.bottom + 5
                }
            ]}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.shoppingListButton]}
                    onPress={handleGenerateShoppingList}
                >
                    <Text style={styles.actionButtonText}>Generate List</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.emailButton]}
                    onPress={handleEmailShoppingList}
                >
                    <Text style={styles.actionButtonText}>Send list</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
    },
    weekRange: {
        fontSize: 16,
        color: '#6c757d',
    },
    scrollContentContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
        flexGrow: 1, // Important for ScrollView to allow content to grow
    },

    dayContainer: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    dayInfo: {
        flex: 1,
    },
    dayName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 2,
    },
    dayDate: {
        fontSize: 14,
        color: '#6c757d',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#75b090',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    mealsContainer: {
        minHeight: 40,
    },
    mealItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2c3e50',
        marginBottom: 2,
    },
    mealServings: {
        fontSize: 14,
        color: '#6c757d',
    },
    removeMealButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#dc3545',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeMealText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    noMealsText: {
        fontSize: 14,
        color: '#6c757d',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 12,
    },
    bottomActions: {
        backgroundColor: 'white',
        paddingHorizontal: 16, // Use horizontal padding
        paddingTop: 5,      // Keep top padding for the buttons' container
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0, // Position at the bottom of the screen
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    shoppingListButton: {
        backgroundColor: '#c6dde6',
    },
    emailButton: {
        backgroundColor: '#75b090',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
        paddingVertical: 8,
    },
    titleheader: {
        fontFamily: 'DancingScriptB',
        fontSize: 36,
        color: '#696969',
    },
});