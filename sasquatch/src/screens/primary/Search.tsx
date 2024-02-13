import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View, ScrollView} from 'react-native';
import {ActivityIndicator, Searchbar} from 'react-native-paper';
import {OmniSearchTypeButtons, SearchType} from '../../components/search';
import {SharedNavigator} from './Shared';
import {List as BookList} from '../../components/book';
import {useApi} from '../../api';
import {UserBookRead} from '../../generated/jericho';

const SearchScreen = () => {
  const {booksApi} = useApi();
  const includedSearchTypes: SearchType[] = [
    SearchType.Books,
    SearchType.Members,
  ];
  const [searchType, setSearchType] = useState<SearchType>(
    includedSearchTypes[0],
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const clearSearchQuery = () => setSearchQuery('');
  const [loading, setLoading] = useState<boolean>(false);

  const [booksResults, setBooksResults] = useState<UserBookRead[]>([]);

  // TODO loader wheel
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log(searchQuery);
      if (searchQuery !== '') {
        setLoading(true);
        booksApi
          .searchBooksBooksSearchQGet(searchQuery)
          .then(response => {
            setBooksResults(response.data.books ?? []);
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setBooksResults([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [booksApi, searchQuery, setBooksResults]);

  return (
    <SafeAreaView>
      <Searchbar
        style={styles.searchBar}
        placeholder={`Search for ${searchType}...`}
        onChangeText={setSearchQuery}
        value={searchQuery}
        onClearIconPress={clearSearchQuery}
      />
      <View style={styles.searchButtons}>
        <OmniSearchTypeButtons
          searchType={searchType}
          setSearchType={setSearchType}
          includedSearchTypes={includedSearchTypes}
        />
      </View>
      {loading ? ( // Show loader while loading
        <View style={styles.loaderContainer}>
          <ActivityIndicator />
        </View>
      ) : searchQuery ? ( // Show BookList if searchQuery is not empty
        <ScrollView>
          <BookList userBooks={booksResults} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

const SearchTab = SharedNavigator(SearchScreen);

export default SearchTab;

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 10,
    marginHorizontal: 20,
  },
  searchButtons: {
    marginHorizontal: 20,
  },
  headline: {
    alignSelf: 'center',
  },
  loaderContainer: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
