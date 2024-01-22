import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Title} from './Title';
import {CollectionTabView} from './TabView';
import {CollectionRead} from '../../generated/jericho';

interface ScreenProps {
  collection: CollectionRead;
}

export const Screen = ({collection}: ScreenProps) => {
  // const {user: bibliUser} = useContext(UserContext);
  // Get user collection link.

  // TODO if not owned show follow button.
  return (
    // TODO use different TabView to enable ScrollView.
    // https://github.com/satya164/react-native-tab-view/issues/1274
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Title style={styles.profileBanner} collection={collection} />
        <Text style={styles.socialText}>52 Books • 24 Followers</Text>
      </View>
      <CollectionTabView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: 10,
  },
  socialText: {
    textAlign: 'center',
  },
  profileBanner: {
    padding: 20,
  },
  profileButtons: {
    padding: 10,
  },
});
