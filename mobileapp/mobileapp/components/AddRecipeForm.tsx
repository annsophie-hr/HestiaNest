import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Button, Platform } from 'react-native';
// import { Picker } from '@react-native-picker/picker'; // This import is not used as you've implemented custom dropdowns
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'; // For navigation and params 

interface Ingredient {
  name: string;
  amount: number | null;
  unit: string;
}

const AddRecipeForm: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEditMode = !!id; // Check 

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: null , unit: '' }]);
  const [instructions, setInstructions] = useState(['']);
  const [cookingTime, setCookingTime] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [servings, setServings] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  // State to manage which ingredient's unit picker is open
  const [unitPickerIndex, setUnitPickerIndex] = useState<number | null>(null); 

  useEffect(() => {
    if (isEditMode) {
      fetch(`https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev/recipes/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to load recipe');
          }
          return res.json();
        })
        .then(data => {
          setName(data.name || '');
          setCategory(data.category || '');
          setIngredients(data.ingredients || [{ name: '', amount: null, unit: '' }]);
          setInstructions(data.instructions || ['']);
          setCookingTime(data.cooking_time?.toString() || '');
          setPreparationTime(data.preparation_time?.toString() || '');
          setServings(data.servings?.toString() || '');
          setImageUrl(data.image_url || '');
          setTags(data.tags || []);
        })
        .catch(err => {
          console.error('Error loading recipe:', err);
          showAlert('Fehler', 'Rezept konnte nicht geladen werden.');
        });
    }
  }, [id]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: null, unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    );
    setIngredients(updated);
  };

  const handleAmountChange = (index: number, text: string) => {
    const newIngredients = [...ingredients];
    const parsed = parseFloat(text);
    newIngredients[index].amount = isNaN(parsed) ? null : parsed;
    setIngredients(newIngredients);
  };

  const handleUnitChange = (index: number, text: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index].unit = text;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = instructions.map((inst, i) => 
      i === index ? value : inst
    );
    setInstructions(updated);
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Helper function to reset the form
  const resetForm = () => {
    setName('');
    setCategory('');
    setIngredients([{ name: '', amount: null, unit: '' }]);
    setInstructions(['']);
    setCookingTime('');
    setPreparationTime('');
    setServings('');
    setImageUrl('');
    setTags([]);
    setCurrentTag('');
    setShowSuccessMessage(false);
  };

  // Web-compatible alert function
  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      // Using window.confirm for web as Alert.alert is not available
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && onOk) {
        onOk();
      }
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      resetForm();
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showAlert('Error', 'Recipe name is required');
      return;
    }

    if (ingredients.some(ing => !ing.name.trim())) {
      showAlert('Error', 'Please fill in all ingredient names');
      return;
    }

    if (instructions.some(inst => !inst.trim())) {
      showAlert('Error', 'Please fill in all instruction steps');
      return;
    }

    const recipeData = {
      name: name.trim(),
      category: category.trim(),
      ingredients: ingredients.filter(ing => ing.name.trim()),
      instructions: instructions.filter(inst => inst.trim()),
      cooking_time: parseInt(cookingTime) || 0,
      preparation_time: parseInt(preparationTime) || 0,
      servings: parseInt(servings) || 1,
      image_url: imageUrl.trim(),
      tags: tags
    };

    setIsSubmitting(true);

    const method = isEditMode ? 'PUT' : 'POST';
    const endpoint = isEditMode
      ? `https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev/recipes/${id}`
      : `https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev/recipes`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Recipe saved successfully:', result);

      showAlert(
        'Erfolg',
        isEditMode ? 'Rezept aktualisiert!' : 'Rezept gespeichert!',
        () => router.back()
      );

    } catch (error) {
      console.error('Error saving recipe:', error);
      showAlert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <> 
      <Stack.Screen
        options=
        {{ title: 'Add Recipe' }}
      />
      <ScrollView style={styles.container}>
        {/* Success Message Banner */}
        {showSuccessMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✅ Recipe saved successfully!</Text>
          </View>
        )}
        
        <Text style={styles.title}>Add New Recipe</Text>
        
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Recipe Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name des Rezepts"
          />
          
          <Text style={styles.label}>Category</Text>
          {/* Custom Category Dropdown Trigger */}
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={category ? styles.selectedCategory : styles.placeholderCategory}>
            {category || 'Choose a category...'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {/* Category Selection Modal */}
          {showCategoryPicker && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>
                {[
                  { label: "Salad", value:"Salads" },
                  { label: "Soup", value:"Soups" },
                  { label: "Dinner", value:"Main Course" },
                  { label: "Dessert", value:"Desserts" },
                  { label: "Baking", value:"Baking" },
                  { label: "Other", value:"Other" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.categoryOption}
                    onPress={() => {
                      setCategory(item.value);      // Set the selected category
                      setShowCategoryPicker(false);  // Close the modal
                    }}
                  >
                    <Text style={styles.categoryText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
                <Button title="Cancel" onPress={() => setShowCategoryPicker(false)} />
              </View>
            </View>
          )}
          
          <Text style={styles.label}>Image</Text>
          <TouchableOpacity style={styles.imageButton} onPress={() => console.log('Select image')}>
            <Text style={styles.imageButtonText}>📷 Add Photo</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Or paste image URL"
          />
        </View>

        {/* Time and Servings */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Prep Time (min)</Text>
              <TextInput
                style={styles.input}
                value={preparationTime}
                onChangeText={setPreparationTime}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Cook Time (min)</Text>
              <TextInput
                style={styles.input}
                value={cookingTime}
                onChangeText={setCookingTime}
                keyboardType="numeric"
                placeholder="45"
              />
            </View>
          </View>
          
          <Text style={styles.label}>Servings</Text>
          <TextInput
            style={styles.input}
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
            placeholder="4"
          />
        </View>

        {/* Ingredients */}
        {/* Ingredients */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Ingredients</Text>

  {ingredients.map((ingredient, index) => (
    <View key={index} style={styles.ingredientRow}>
      <TextInput
        style={[styles.input, styles.ingredientName]}
        value={ingredient.name}
        onChangeText={(text) => updateIngredient(index, 'name', text)}
        placeholder="Ingredient name"
      />
      <TextInput
        style={[styles.input, styles.ingredientAmount]}
        value={ingredient.amount !== null ? ingredient.amount.toString() : ''}
        keyboardType="numeric"
        onChangeText={(text) => handleAmountChange(index, text)}
        placeholder="Amount (eg. 2 EL)"
      />
      {/* Unit dropdown button */}
      <TouchableOpacity
        // Use ingredientUnitSelector for combined styles, and ensure no ingredientAmountUnit is overriding flex
        style={styles.ingredientUnitSelector}
        onPress={() => setUnitPickerIndex(index)}
      >
        <Text style={ingredient.unit ? styles.selectedCategory : styles.placeholderCategory}>
          {ingredient.unit || 'Stueck'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* Unit Selection Modal - keep this as is */}
      {unitPickerIndex === index && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Unit</Text>
            {[
              'Stueck', 'g', 'ml', 'TL', 'EL', 'Prise',
              'Tasse', 'Liter', 'Dose', 'Bund', 'Schuss',
              'Packung', 'Messerspitze'
            ].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={styles.categoryOption}
                onPress={() => {
                  handleUnitChange(unitPickerIndex, unit);
                  setUnitPickerIndex(null);
                }}
              >
                <Text style={styles.categoryText}>{unit}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" onPress={() => setUnitPickerIndex(null)} />
          </View>
        </View>
      )}
    </View>
  ))}

  {/* IMPORTANT: This is where you put the 'Add Ingredient' and 'Remove Last' buttons */}
  <View style={styles.bottomButtonsRow}>
    <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
      <Text style={styles.addButtonText}>+ Add Ingredient</Text>
    </TouchableOpacity>
    {/* Only show 'Remove Last' if there are ingredients to remove */}
    {ingredients.length > 0 && (
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeIngredient(ingredients.length - 1)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
</View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <TextInput
                style={[styles.input, styles.instructionInput]}
                value={instruction}
                onChangeText={(text) => updateInstruction(index, text)}
                placeholder="Enter instruction step"
                multiline
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeInstruction(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
            <Text style={styles.addButtonText}>+ Add Step</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, styles.tagInput]}
              value={currentTag}
              onChangeText={setCurrentTag}
              placeholder="Add a tag"
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Save recipe'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 33,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'DancingScript-Bold', 
    color : '#696969',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#696969',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white', // light grey
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    height: 45,
  },
ingredientUnitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white', // light grey
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    height: 45,
    flex: 1.3,
    marginRight: 5,
  },
dropdownArrow: {
    fontSize: 12,
  },
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.13)', // semi-transparent background
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
modalContent: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 4,
  },
modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
categoryOption: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
categoryText: {
    fontSize: 18,
    color: '#333',
  },
cancelButton: {
    marginTop: 8,
    marginBottom: 3,
  },
input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
    height: 45
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientName: {
    flex: 2,
    marginRight: 5,
  },
  ingredientAmount: {
    flex: 1,
    marginRight: 5,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  selectedCategory: {
  fontSize: 16,
  color: '#333',
},
placeholderCategory: {
  fontSize: 16, 
  color: '#A9A9A9', // Lighter color for placeholder
},
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginRight: 10,
    minWidth: 25,
  },
  instructionInput: {
    flex: 1,
    marginRight: 5,
    minHeight: 40,
  },
  removeButton: {
    backgroundColor: '#f28c8c',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 15,

  },
  addButton: {
    backgroundColor: '#d8e8dc',
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#696969',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: '#a1d6e8',
    padding: 10,
    borderRadius: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    marginRight: 5,
  },
  tagRemove: {
    color: '#666',
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#696969',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successBanner: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddRecipeForm;