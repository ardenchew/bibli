import React from 'react';
import {StyleSheet, Image, Text, View} from 'react-native';
import {Card, Avatar, IconButton} from 'react-native-paper';
import {
  CollectionType,
  Reaction,
  ReviewRead,
  UserBookRead,
} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme'; // Adjust the import path

// Define the mapping from indicators to colors
const reactionColorMap: {[key in Reaction]: string} = {
  [Reaction.Positive]: '#0cb256', // green
  [Reaction.Neutral]: '#e39700', // yellow
  [Reaction.Negative]: '#d53325', // red
};

const ReviewIndicator = ({review}: {review: ReviewRead}) => {
  const color = reactionColorMap[review.reaction];
  return (
    <View style={styles.ratingIndicatorContainer}>
      <Text style={[styles.ratingIndicatorText, {color}]}>
        {review.rating.toFixed(1)}
      </Text>
    </View>
  );
};

interface RightIndicators {
  hasCompleteCollection: boolean;
  hasSavedCollection: boolean;
  review?: ReviewRead;
}

const RightIndicators = ({
  hasCompleteCollection,
  hasSavedCollection,
  review,
}: RightIndicators) => {
  return (
    <View style={styles.rightContainer}>
      {review ? (
        <ReviewIndicator review={review} />
      ) : hasCompleteCollection ? (
        <>
          <IconButton style={styles.rightIcon} icon={'check-circle'} />
        </>
      ) : (
        <>
          <IconButton style={styles.rightIcon} icon={'plus-circle-outline'} />
          <IconButton
            style={styles.rightIcon}
            icon={hasSavedCollection ? 'bookmark' : 'bookmark-outline'}
          />
        </>
      )}
      <IconButton
        style={styles.rightIcon}
        icon={'dots-vertical'}
        onPress={() => {}}
        rippleColor={'transparent'}
      />
    </View>
  );
};

interface Props {
  userBook: UserBookRead;
}

const Item = ({userBook}: Props) => {
  const hasCompleteCollection =
    userBook.collections?.some(
      collection => collection.type === CollectionType.Complete,
    ) ?? false;
  const hasSavedCollection =
    userBook.collections?.some(
      collection => collection.type === CollectionType.Saved,
    ) ?? false;

  return (
    <Card
      mode={'contained'}
      style={styles.container}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={userBook.book.title}
        subtitle={userBook.authors?.join(', ')}
        left={props =>
          userBook.book.cover_link ? (
            <Image
              source={{uri: userBook.book.cover_link}}
              style={styles.bookImage}
            />
          ) : (
            <Avatar.Icon {...props} icon="book" />
          )
        }
        right={() => (
          <RightIndicators
            hasCompleteCollection={hasCompleteCollection}
            hasSavedCollection={hasSavedCollection}
            review={userBook.review}
          />
        )}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    elevation: 2,
  },
  bookImage: {
    height: 70,
    resizeMode: 'contain',
  },
  rightContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  rightIcon: {
    margin: 0,
    marginLeft: -10,
    padding: 0,
    alignSelf: 'center',
  },
  ratingIndicatorContainer: {
    borderColor: LightTheme.colors.outline,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  ratingIndicatorText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default Item;
