import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import Button from '../components/Button/Button';
import {useAuth0} from 'react-native-auth0';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

const FinishButton = ({navigation}: Props) => {
  const onPress = () => {
    navigation.navigate('Username');
  };

  return (
    <Button onPress={onPress} mode="contained" style={styles.finishButton}>
      Finish
    </Button>
  );
};

const BioScreen = ({navigation}: Props) => {
  const {user} = useAuth0();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        Thanks! A few last things
      </Text>
      <View style={styles.textInputView}>
        <Text variant="titleMedium">What shall we call you?</Text>
        <TextInput
          label={'First name'}
          textContentType="name"
          mode="outlined"
          defaultValue={user?.givenName}
          maxLength={20}
        />
        <TextInput
          label={'Last name'}
          textContentType="name"
          mode="outlined"
          defaultValue={user?.familyName}
          maxLength={20}
        />
      </View>
      <FinishButton navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  headline: {
    flex: 1,
  },
  textInputView: {
    flex: 5,
    justifyContent: 'flex-start',
  },
  finishButton: {
    alignSelf: 'center',
  },
});

export default BioScreen;
