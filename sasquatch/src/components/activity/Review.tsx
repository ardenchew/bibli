import React, {ReactNode, useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';
import {
  ActivityRead,
  ReviewActivityRead,
  UserBookRead,
} from '../../generated/jericho';
import {Item} from '../book/Item';
import {ApiContext, UserContext} from '../../context';
import {UserPress, BookPress} from './Navigation';
import {ActivityBottomBar} from './BottomBar';
import {ReviewIndicatorText} from '../book/Indicators';
import {UserAvatarCallback} from '../profile/Avatar';

interface ReviewTitleProps {
  subActivity: ReviewActivityRead;
  userBook?: UserBookRead;
}

const ReviewTitle = ({subActivity, userBook}: ReviewTitleProps) => {
  return userBook ? (
    <Text style={{fontSize: 15, lineHeight: 22}}>
      <Text onPress={UserPress(subActivity.user)} style={{fontWeight: 'bold'}}>
        {subActivity.user.name}
      </Text>
      <Text>{' rated '}</Text>
      <Text onPress={BookPress(userBook)} style={{fontWeight: 'bold'}}>
        {userBook.book.title}
      </Text>
      <Text> </Text>
      {subActivity.review.hide_rank ? (
        <Text>{subActivity.review.reaction + 'ly'}</Text>
      ) : (
        <ReviewIndicatorText review={subActivity.review} />
      )}
    </Text>
  ) : null;
};

interface ReviewCardProps {
  activity: ActivityRead;
  subActivity: ReviewActivityRead;
  refresh?: () => void;
  disableComment?: boolean;
}

export const ReviewCard = ({
  activity,
  subActivity,
  refresh,
  disableComment,
}: ReviewCardProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {booksApi} = useContext(ApiContext);
  const [userBook, setUserBook] = useState<UserBookRead>();
  const [title, setTitle] = useState<ReactNode>(
    <ReviewTitle subActivity={subActivity} userBook={userBook} />,
  );

  useEffect(() => {
    if (bibliUser) {
      const initBookItem = async () => {
        try {
          const response = await booksApi.getUserBookBookBookIdUserIdGet(
            subActivity.review.book_id,
            bibliUser.id,
          );
          setUserBook(response.data);
        } catch (e) {
          console.log(e);
        }
      };
      initBookItem().catch(e => console.log(e));
    }
  }, [bibliUser, booksApi, subActivity.review.book_id]);

  useEffect(() => {
    setTitle(<ReviewTitle subActivity={subActivity} userBook={userBook} />);
  }, [subActivity, userBook]);

  return activity.review ? (
    <Card
      mode={'contained'}
      style={styles.container}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        style={{marginVertical: -5}}
        title={title}
        titleNumberOfLines={3}
        left={UserAvatarCallback({user: subActivity.user, pressable: true})}
      />
      <Card.Content
        style={{
          width: '100%',
          paddingHorizontal: 0,
          paddingBottom: 0,
          justifyContent: 'space-between',
        }}>
        <View>
          {userBook && (
            <View>
              <Item userBook={userBook} mode={'elevated'} />
            </View>
          )}
          {subActivity.review.notes && (
            <Text style={{margin: 10}}>{subActivity.review.notes}</Text>
          )}
          <ActivityBottomBar activity={activity} refresh={refresh} disableComment={disableComment} />
        </View>
      </Card.Content>
    </Card>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 2,
  },
});
