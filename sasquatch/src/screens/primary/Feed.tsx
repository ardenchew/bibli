import React, {useContext, useLayoutEffect} from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import {SharedNavigator} from './Shared';
import ActivityList from '../../components/activity/List';
import {useNavigation} from '@react-navigation/native';
import {UserRead} from '../../generated/jericho';
import {UserContext} from '../../context';

const {width} = Dimensions.get('window');

const headerLeft = (bibliUser: UserRead | null) => {
  let modifiedName = bibliUser?.name ?? '';
  const nameParts = modifiedName.trim().split(/\s+/);
  if (nameParts.length > 1) {
    // If there's more than one word, take the first word and the initial of the last word
    modifiedName = `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(
      0,
    )}.`;
  }

  return () => (
    <View style={styles.headerLeft}>
      {modifiedName !== '' && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{fontWeight: '400', fontSize: 20}}>
          {modifiedName}
        </Text>
      )}
    </View>
  );
};

const headerTitle = () => {
  return (
    <View style={styles.headerTitle}>
      <Image
        source={require('../../../assets/logo.png')}
        resizeMode={'contain'}
        style={styles.logo}
      />
    </View>
  );
};

const headerRight = () => {
  return (
    <View style={styles.headerRight}>
      <IconButton icon={'bell-outline'} onPress={() => {}} disabled={true} />
    </View>
  );
};

const FeedScreen = () => {
  const navigation = useNavigation();
  const {user: bibliUser} = useContext(UserContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: headerLeft(bibliUser),
      headerTitle: headerTitle,
      headerRight: headerRight,
    });
  }, [bibliUser, navigation]);

  const activities: string[] = ['a', 'b', 'c'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ActivityList activities={activities} />
      </ScrollView>
    </SafeAreaView>
  );
};

const FeedTab = SharedNavigator(FeedScreen);

export default FeedTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headline: {
    alignSelf: 'center',
  },
  headerLeft: {
    maxWidth: width / 3,
  },
  headerTitle: {
    maxWidth: width / 3,
    height: 76,
    marginTop: -16,
  },
  headerRight: {
    maxWidth: width / 3,
    marginVertical: -10,
    marginHorizontal: -10,
  },
  logo: {
    height: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
});
