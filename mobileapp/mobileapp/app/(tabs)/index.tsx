import { SafeAreaView, ScrollView, View, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { Platform } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={require('@/assets/images/geckstia.png')}
          style={styles.geckstiaLogo}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.header}>
            Welcome to our favourite family recipes
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.subheader}>What do you want to make this week? </Text>
          <Image
            source={require('@/assets/images/familienbild.jpg')}
            style={{
              marginTop: 15,
              width: screenWidth-32,
              height: 200,
              marginLeft: 2,
              borderRadius: 12,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    paddingBottom: 20,
  },
  
  geckstiaLogo: {
    height: 150,
    width: 150,
    margin: 10,
    borderRadius: 20,
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  header: {
    fontFamily: 'DancingScriptB',
    fontSize: 36,
    color: '#696969',
  },
  subheader: {
    fontSize: 22,
    color: '#696969',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 16
  },
});
