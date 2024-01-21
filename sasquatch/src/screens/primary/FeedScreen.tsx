import React, {useContext} from 'react';
import {UserContext} from '../../context';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import LogoutButton from '../../components/header/Logout';

const FeedScreen = () => {
  const {user: bibliUser} = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.headline}>
        Feed of {bibliUser?.name}
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

export default FeedScreen;
