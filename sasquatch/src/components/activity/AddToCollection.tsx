import React, {ReactNode, useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';
import {
  ActivityRead,
  AddToCollectionActivityRead,
  UserBookRead,
} from '../../generated/jericho';
import {Item} from '../book/Item';
import {ApiContext, UserContext} from '../../context';
import {UserPress, BookPress, CollectionPress} from './Navigation';
import {ActivityBottomBar} from './BottomBar';

interface AddToCollectionTitleProps {
  subActivity: AddToCollectionActivityRead;
}

const AddToCollectionTitle = ({subActivity}: AddToCollectionTitleProps) => {
  const userBook: UserBookRead = {
    user_id: subActivity.user.id,
    book: subActivity.book,
  };

  return (
    <Text style={{fontSize: 15, lineHeight: 22}}>
      <Text onPress={UserPress(subActivity.user)} style={{fontWeight: 'bold'}}>
        {subActivity.user.name}
      </Text>
      <Text> added </Text>
      <Text onPress={BookPress(userBook)} style={{fontWeight: 'bold'}}>
        {subActivity.book.title}
      </Text>
      <Text> to </Text>
      <Text
        onPress={CollectionPress(subActivity.collection)}
        style={{fontWeight: 'bold'}}>
        {subActivity.collection.name}
      </Text>
    </Text>
  );
};

interface AddToCollectionCardProps {
  activity: ActivityRead;
  subActivity: AddToCollectionActivityRead;
  refresh?: () => void;
  disableComment?: boolean;
}

export const AddToCollectionCard = ({
  activity,
  subActivity,
  refresh,
  disableComment,
}: AddToCollectionCardProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {booksApi} = useContext(ApiContext);
  const [title, setTitle] = useState<ReactNode>(
    <AddToCollectionTitle subActivity={subActivity} />,
  );
  const [userBook, setUserBook] = useState<UserBookRead>();

  useEffect(() => {
    setTitle(<AddToCollectionTitle subActivity={subActivity} />);
  }, [subActivity]);

  useEffect(() => {
    if (bibliUser) {
      const initBookItem = async () => {
        try {
          const response = await booksApi.getUserBookBookBookIdUserIdGet(
            subActivity.book.id,
            bibliUser.id,
          );
          setUserBook(response.data);
        } catch (e) {
          console.log(e);
        }
      };
      initBookItem().catch(e => console.log(e));
    }
  }, [bibliUser, booksApi, subActivity.book.id]);

  return activity.add_to_collection ? (
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
        left={props => <Avatar.Icon {...props} icon="account-outline" />}
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
