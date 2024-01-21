import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import LogoutButton from '../../components/header/Logout';

const SearchScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.headline}>
        SEARCH
      </Text>
      <View>
        <LogoutButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  headline: {
    alignSelf: 'center',
  },
});

export default SearchScreen;
