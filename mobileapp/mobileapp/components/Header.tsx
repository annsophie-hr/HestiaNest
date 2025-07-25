// mobileapp/components/Header.tsx

// components/AppHeader.tsx
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import ThemedText from './ThemedText'; // if you want to keep ThemedText
import { StatusBar } from 'expo-status-bar';  

export default function AppHeader({ title }) {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    DancingScript: require('../assets/fonts/DancingScript-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ecf8fbff' }
    ]}
  >
      <Image
        source={require('@/assets/images/geckstiahead.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.title,{ color: colorScheme === 'dark' ? '#fff' : '#333', fontFamily: 'DancingScriptB' }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  logo: {
    width: 75,
    height: 75,
    marginRight: 10,
    borderRadius: 10
  },
  title: {
    fontSize: 33,
    fontFamily: 'DancingScriptB',   
    color : '#696969',
    flex: 1,
    textAlign: 'center',
    marginLeft: -38
  },
});
