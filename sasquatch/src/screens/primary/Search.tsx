import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {Searchbar, Text} from 'react-native-paper';
import LogoutButton from '../../components/header/Logout';
import {OmniSearchTypeButtons, SearchType} from '../../components/search';
import {SharedNavigator} from './Shared';

const SearchScreen = () => {
  const includedSearchTypes: SearchType[] = [
    SearchType.Books,
    SearchType.Members,
  ];
  const [searchType, setSearchType] = useState<SearchType>(
    includedSearchTypes[0],
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const clearSearchQuery = () => setSearchQuery('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log(searchQuery);
      // Send Axios request here
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        style={styles.searchBar}
        placeholder={`Search for ${searchType}...`}
        onChangeText={setSearchQuery}
        value={searchQuery}
        onClearIconPress={clearSearchQuery}
      />
      <OmniSearchTypeButtons
        searchType={searchType}
        setSearchType={setSearchType}
        includedSearchTypes={includedSearchTypes}
      />
      {/*<ScrollView>*/}

      {/*</ScrollView>*/}
      <Text variant="headlineLarge" style={styles.headline}>
        SEARCH
      </Text>
      <View>
        <LogoutButton />
      </View>
    </SafeAreaView>
  );
};

const SearchTab = SharedNavigator(SearchScreen);

export default SearchTab;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    // flex: 1,
    // justifyContent: 'space-evenly',
  },
  searchBar: {
    marginBottom: 10,
  },
  headline: {
    alignSelf: 'center',
  },
});
