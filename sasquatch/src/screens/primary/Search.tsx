import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Searchbar, Text} from 'react-native-paper';
import {OmniSearchTypeButtons, SearchType} from '../../components/search';
import {SharedNavigator} from './Shared';
import {List as BookList} from '../../components/book';
import UserList from '../../components/social/List';
import {useApi} from '../../api';
import {UserBookRead, UserRead} from '../../generated/jericho';

const SearchScreen = () => {
  const {booksApi, usersApi, collectionsApi} = useApi();
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
  const [membersResults, setMembersResults] = useState<UserRead[]>([]);
  const [noResults, setNoResults] = useState<boolean>(false);

  useEffect(() => {
    let delayDebounceFn: NodeJS.Timeout;

    if (searchQuery.length > 1) {
      delayDebounceFn = setTimeout(() => {
        setLoading(true);
        const searchPromise =
          searchType === SearchType.Books
            ? booksApi.searchBooksBooksSearchQGet(searchQuery)
            : usersApi.searchUsersUserSearchQGet(searchQuery);

        searchPromise
          .then(
            (response: {
              data: {books?: UserBookRead[]; users?: UserRead[]};
            }) => {
              if (searchType === SearchType.Books) {
                setBooksResults(response.data.books ?? []);
                setNoResults(response.data.books?.length === 0 ?? false);
              } else {
                setMembersResults(response.data.users ?? []);
                setNoResults(response.data.users?.length === 0 ?? false);
              }
            },
          )
          .catch((error: Error) => {
            console.error(error);
            setNoResults(true);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 500);
    } else {
      setLoading(false);
      setBooksResults([]);
      setMembersResults([]);
      setNoResults(false);
    }

    return () => clearTimeout(delayDebounceFn);
  }, [booksApi, usersApi, searchQuery, searchType]);

  const renderNoResults = () => {
    return (
      <View
        style={{
          marginTop: 20,
          alignItems: 'center',
        }}>
        <Text style={{fontSize: 17}}>No {searchType} found 🤷</Text>
      </View>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator />
        </View>
      );
    }

    if (searchQuery.length > 1 && searchType === SearchType.Books) {
      if (noResults) {
        return renderNoResults();
      }
      return (
        <ScrollView keyboardShouldPersistTaps={'handled'}>
          <BookList userBooks={booksResults} collectionsApi={collectionsApi} />
        </ScrollView>
      );
    }

    if (searchQuery.length > 1 && searchType === SearchType.Members) {
      if (noResults) {
        return renderNoResults();
      }
      return (
        <ScrollView keyboardShouldPersistTaps={'handled'}>
          <UserList users={membersResults} />
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Searchbar
        style={styles.searchBar}
        autoCorrect={false}
        placeholder={`Search for ${searchType}...`}
        onChangeText={text => {
          setNoResults(false);
          setSearchQuery(text);
        }}
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
      {renderResults()}
    </SafeAreaView>
  );
};

const SearchTab = SharedNavigator(SearchScreen);

export default SearchTab;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
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
