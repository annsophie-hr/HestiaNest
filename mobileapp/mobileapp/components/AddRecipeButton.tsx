import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  onPress: () => void;
};

export default function AddRecipeButton({ onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <View style={styles.row}>
        <MaterialIcons name="add" size={24} color= '#696969' />
        <Text style={styles.text}>Add Recipe</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#75b090', // minty green
    borderRadius: 16,
    width: '100%',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    alignItems: 'center',
  },

  text: {
    marginTop: 8,
    color : '#484848',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
});
