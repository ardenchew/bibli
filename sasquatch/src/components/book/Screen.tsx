import React, {useCallback, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {CollectionType, UserBookRead} from '../../generated/jericho';
import {Button, Divider, Text} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useHeaderHeight} from '@react-navigation/elements';
import {RightIndicators} from './Item';

const {height} = Dimensions.get('window');
const backgroundHeight = height;

export const Background = ({userBook}: {userBook: UserBookRead}) => {
  return (
    <View style={styles.backgroundContainer}>
      <ImageBackground
        source={{uri: userBook.book.cover_link}}
        resizeMode={'cover'}
        blurRadius={10}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['transparent', LightTheme.colors.background]}
        locations={[0.4, 1.0]}
        style={styles.backgroundGradient}
      />
    </View>
  );
};

export const Headline = ({userBook}: {userBook: UserBookRead}) => {
  const title = userBook.book.subtitle
    ? `${userBook.book.title}: ${userBook.book.subtitle}`
    : userBook.book.title;
  const headerHeight = useHeaderHeight();
  const marginTop = -headerHeight * 1.5;
  const authors = userBook.authors?.map(author => author.name).join(', ')

  const hasCompleteCollection =
    userBook.collections?.some(
      collection => collection.type === CollectionType.Complete,
    ) ?? false;
  const hasSavedCollection =
    userBook.collections?.some(
      collection => collection.type === CollectionType.Saved,
    ) ?? false;

  return (
    <View style={{...styles.headlineContainer, marginTop: marginTop}}>
      <Image
        style={styles.headlineImage}
        source={{uri: userBook.book.cover_link}}
        resizeMode={'cover'}
      />
      <View style={styles.headlineTitle}>
        <Text style={styles.headlineTitleFont}>{title}</Text>
        <Text style={styles.headlineAuthorFont}>by: {authors}</Text>
        <View style={styles.headlineButtonContainer}>
          <RightIndicators
            book={userBook}
            hasCompleteCollection={hasCompleteCollection}
            hasSavedCollection={hasSavedCollection}
          />
        </View>
      </View>
    </View>
  );
};

export const TopSection = ({userBook}: {userBook: UserBookRead}) => {
  const headerHeight = useHeaderHeight();
  const marginTop = -backgroundHeight + headerHeight * 3;
  return (
    <View style={{...styles.topSection, marginTop: marginTop}}>
      <Background userBook={userBook} />
      <Headline userBook={userBook} />
    </View>
  );
};

export const InfoSection = ({userBook}: {userBook: UserBookRead}) => {
  let detailStrArray: string[] = [];
  if (userBook.book.pages) {
    detailStrArray.push(`${userBook.book.pages} pages`);
  }
  if (userBook.book.publication_date) {
    detailStrArray.push(`Published ${userBook.book.publication_date}`);
  }
  const detailStr = detailStrArray.join(' • ');

  const initialNumberOfLines = 10;
  const [expanded, setExpanded] = useState<boolean>(false);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const [showMore, setShowMore] = useState<boolean>(false);
  const onTextLayout = useCallback(
    (e: {nativeEvent: {lines: string | any[]}}) => {
      const {lines} = e.nativeEvent;
      setShowMore(lines.length > initialNumberOfLines);
    },
    [],
  );

  return (
    <View style={styles.infoSection}>
      {detailStr && (
        <View>
          <Text style={styles.detailStr}>{detailStr}</Text>
          <Divider style={{marginVertical: 5}} />
        </View>
      )}
      {userBook.book.summary && (
        <View>
          {showMore ? (
            <>
              <Text
                style={styles.summaryStr}
                numberOfLines={expanded ? undefined : initialNumberOfLines}>
                {userBook.book.summary}
              </Text>
              <Button
                mode={'text'}
                onPress={toggleExpand}
                compact={true}
                rippleColor={'transparent'}
                style={{marginVertical: -5}}>
                {expanded ? 'less' : 'more'}
              </Button>
            </>
          ) : (
            <Text style={styles.summaryStr} onTextLayout={onTextLayout}>
              {userBook.book.summary}
            </Text>
          )}
          <Divider style={{marginVertical: 5}} />
        </View>
      )}
    </View>
  );
};

interface ScreenProps {
  userBook: UserBookRead;
}

// TODO this can be a lot better if the background image is stored in the header.
// try using the useNavigation hook with navigation.setOptions to improve.
export const Screen = ({userBook}: ScreenProps) => {
  return (
    <ScrollView style={styles.container}>
      <TopSection userBook={userBook} />
      <InfoSection userBook={userBook} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {},
  backgroundContainer: {
    height: backgroundHeight,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headlineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
  },
  headlineImage: {
    flex: 1,
    aspectRatio: 1,
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 50,
    overflow: 'visible',
  },
  headlineTitle: {
    flex: 2,
    marginLeft: 10,
    marginRight: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headlineTitleFont: {
    fontSize: 23,
    marginBottom: 10,
  },
  headlineAuthorFont: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headlineButtonContainer: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  infoSection: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  detailStr: {
    marginVertical: 5,
    alignSelf: 'center',
  },
  summaryStr: {
    marginVertical: 5,
    alignSelf: 'center',
  },
});
