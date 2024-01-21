import * as React from 'react';
import {BottomNavigation} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';
import {StyleSheet} from 'react-native';
import ProfileTab from './Profile';
import FeedTab from './Feed';
import SearchTab from './Search';

export const Home = () => {
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
    feed: FeedTab,
    search: SearchTab,
    profile: ProfileTab,
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

const styles = StyleSheet.create({
  bar: {
    height: 98,
  },
});
