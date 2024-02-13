import * as React from 'react';
import {View, useWindowDimensions, StyleSheet, ScrollView} from 'react-native';
import {TabBar, TabView, SceneMap} from 'react-native-tab-view';
import {LightTheme} from '../../styles/themes/LightTheme';
import {Button, Text} from 'react-native-paper';
import {UserBookRead, UserRead} from '../../generated/jericho';
import {default as BooksList} from '../book/List';
import UserList from '../social/List';

const mockBooks: UserBookRead[] = [
  {
    user_id: 6,
    book: {
      title: 'Demon Copperhead',
      id: 1,
      cover_link: 'https://covers.openlibrary.org/b/id/13141227-M.jpg',
    },
    // review: {
    //   rating: 6.3,
    //   reaction: 'neutral',
    //   hide_rank: false,
    // },
    collections: [
      {
        id: 1,
        name: 'complete',
        type: 'complete',
      },
    ],
    authors: ['Barbara Kingsolver', 'Joe Mama'],
  },
  {
    user_id: 6,
    book: {
      title: 'Solito',
      id: 2,
      cover_link: 'https://covers.openlibrary.org/b/id/11408459-M.jpg',
    },
    // review: {
    //   rating: 3.1,
    //   reaction: 'negative',
    //   hide_rank: false,
    // },
    collections: [
      {
        id: 1,
        name: 'saved',
        type: 'saved',
      },
    ],
    authors: ['Javier Zamora'],
  },
  {
    user_id: 6,
    book: {
      title: 'This is Happiness',
      id: 3,
      cover_link: 'https://covers.openlibrary.org/b/id/9258937-M.jpg',
    },
    review: {
      rating: 10.0,
      reaction: 'positive',
      hide_rank: false,
    },
    collections: [
      {
        id: 1,
        name: 'complete',
        type: 'complete',
      },
    ],
    authors: ['Niall Williams'],
  },
];

const mockCollaborators: UserRead[] = [
  {
    name: 'Emily',
    id: 1,
    tag: 'emily',
  },
  {
    name: 'Mesther',
    id: 2,
    tag: 'cat_in_the_hat_enthusiast',
  },
  {
    name: 'Adam Grail',
    id: 3,
    tag: 'builtdifferent',
  },
  {
    name: 'Michelle',
    id: 4,
    tag: 'pursegorl',
  },
  {
    name: 'Drew Leonard',
    id: 5,
    tag: 'chef-welly',
  },
  {
    name: 'George William Peter Horrell The Fifth',
    id: 6,
    tag: 'brit',
  },
  {
    name: 'Arielle Grail',
    id: 7,
    tag: 'taylorswiftmegafan69420',
  },
];

const BooksRoute = () => {
  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.routeContainer}>
        <BooksList userBooks={mockBooks} />
      </ScrollView>
    </View>
  );
};

// TODO if not owned don't show collaborators route.
const CollaboratorsRoute = () => {
  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.routeContainer}>
        <UserList users={mockCollaborators} />
      </ScrollView>
      <Button
        compact={true}
        icon={'plus'}
        onPress={() => {}}
        mode={'elevated'}
        children={'Add Collaborator'}
        style={{
          position: 'absolute',
          alignSelf: 'center',
          bottom: 20,
        }}
      />
    </View>
  );
};

const renderScene = SceneMap({
  first: BooksRoute,
  second: CollaboratorsRoute,
});

export const CollectionTabView = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Books'},
    {key: 'second', title: 'Collaborators'},
  ]);

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      renderTabBar={props => (
        <TabBar
          {...props}
          style={{
            backgroundColor: LightTheme.colors.background,
            borderBottomColor: LightTheme.colors.outline,
            borderBottomWidth: 1,
          }}
          // tabStyle={{backgroundColor: LightTheme.colors.background}}
          indicatorStyle={styles.indicatorStyle}
          renderLabel={({route, focused}) => (
            <Text
              style={{
                color: focused
                  ? LightTheme.colors.scrim
                  : LightTheme.colors.outline,
                fontWeight: focused ? 'bold' : 'normal',
                paddingHorizontal: 8,
              }}>
              {route.title}
            </Text>
          )}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  indicatorStyle: {
    backgroundColor: LightTheme.colors.scrim,
  },
  routeContainer: {
    flex: 1,
  },
});
