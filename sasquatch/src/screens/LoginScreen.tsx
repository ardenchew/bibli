import React from 'react';
import Button from '../components/Button/Button';
import {Image, ImageBackground, StyleSheet, View} from 'react-native';
import {useAuth0} from 'react-native-auth0';
import {Text, useTheme} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {LightTheme} from '../styles/themes/LightTheme';

const LoginButton = () => {
  const {authorize} = useAuth0();

  const onPress = async () => {
    try {
      await authorize({
        additionalParameters: {
          prompt: 'login',
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Button onPress={onPress} mode="text" style={{width: 'auto'}}>
      Already have an account? Log in.
    </Button>
  );
};

const SignUpButton = () => {
  const {authorize} = useAuth0();

  const onPress = async () => {
    try {
      await authorize({
        additionalParameters: {
          prompt: 'login',
          screen_hint: 'signup',
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Button onPress={onPress} mode="contained">
      Get started
    </Button>
  );
};

const LoginScreen = () => {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/login-background.png')}
        style={styles.imageBackground}
      />
      <LinearGradient
        colors={['transparent', colors.onBackground]}
        locations={[0, 0.7]}
        style={styles.linearGradient}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo-whited.png')}
            style={styles.logoImage}
          />
          <Text style={styles.logoBlurb} variant="headlineSmall">
            Your favorite books await.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <SignUpButton />
          <LoginButton />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
  },
  linearGradient: {
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    flex: 4,
    alignSelf: 'center',
  },
  logoImage: {
    flex: 3,
    resizeMode: 'center',
  },
  logoBlurb: {
    flex: 1,
    color: LightTheme.colors.background,
    alignSelf: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default LoginScreen;
