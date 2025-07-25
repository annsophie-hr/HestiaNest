// mobileapp/mobileapp/app/shopping-list.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router'; // Import useLocalSearchParams
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// Define the type for a shopping list item
interface ShoppingListItem {
  name: string;
  amount: number;
  unit: string;
}


const ShoppingListScreen = () => {
  const params = useLocalSearchParams(); // Hook to get parameters from the route
  const { shoppingList, weekRange } = params;

  // Parse the JSON string back into an array
  const parsedShoppingList: ShoppingListItem[] = shoppingList
    ? JSON.parse(shoppingList as string)
    : [];

const sortedShoppingList = [...parsedShoppingList].sort((a, b) => {
// Sort by name first, then by unit
    return a.name.localeCompare(b.name);
});


  return (
    <> 
    <Stack.Screen
      options=
      {{ title: 'Shopping list' }}
    />
    <View style={styles.container}>
      <Text style={styles.header}>Shopping list</Text>
      {weekRange && <Text style={styles.weekRange}>for the week: {weekRange}</Text>}

      {parsedShoppingList.length > 0 ? (
        <View style={styles.listContainer}>
          <FlatList
            data={sortedShoppingList}
            keyExtractor={(item, index) => `${item.name}-${item.unit}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.itemText}>
                  {`${item.amount} ${item.unit} ${item.name}`}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      ) : (
        <Text style={styles.emptyListText}>Keine Artikel auf der Einkaufsliste.</Text>
      )}
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 33,
    fontFamily: 'DancingScript-Bold', 
    color : '#696969',
  },
  weekRange: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flatListContent: {
    paddingBottom: 20, // Add some padding at the bottom for scrolling
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align bullet and text at the top
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bullet: {
    marginRight: 10,
    fontSize: 18, // Slightly larger bullet
    lineHeight: 24, // Adjust to match text line height
    color: '#555',
  },
  itemText: {
    fontSize: 17,
    flexShrink: 1, // Allow text to wrap within the available space
    color: '#333',
    lineHeight: 24, // Consistent line height
  },
  emptyListText: {
    marginTop: 50,
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
});

export default ShoppingListScreen;