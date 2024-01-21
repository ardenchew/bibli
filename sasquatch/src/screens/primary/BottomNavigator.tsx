import * as React from 'react';
import {BottomNavigation} from 'react-native-paper';
import FeedScreen from './FeedScreen';
import SearchScreen from './SearchScreen';
import ProfileScreen from './ProfileScreen';
import {LightTheme} from '../../styles/themes/LightTheme';
import {StyleSheet} from 'react-native';

const MyComponent = () => {
  const [index, setIndex] = React.useState(2);
  const [routes] = React.useState([
    {
      key: 'feed',
      title: 'Feed',
      focusedIcon: 'text-box',
      unfocusedIcon: 'text-box-outline',
    },
    {
      key: 'search',
      title: 'Search',
      focusedIcon: 'magnify-plus',
      unfocusedIcon: 'magnify',
    },
    {
      key: 'profile',
      title: 'Profile',
      focusedIcon: 'account-circle',
      unfocusedIcon: 'account-outline',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    feed: FeedScreen,
    search: SearchScreen,
    profile: ProfileScreen,
  });

  return (
    <BottomNavigation
      navigationState={{index, routes}}
      onIndexChange={setIndex}
      renderScene={renderScene}
      theme={{colors: {secondaryContainer: LightTheme.colors.primaryContainer}}}
      barStyle={styles.bar}
    />
  );
};

export default MyComponent;

const styles = StyleSheet.create({
  bar: {
    height: 98,
  },
});
