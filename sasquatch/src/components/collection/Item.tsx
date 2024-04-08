import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {CollectionRead, CollectionUserLinkType} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ApiContext, UserContext} from '../../context'; // Adjust the import path

interface Props {
  collection: CollectionRead;
}

const CardPress = (collection: CollectionRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Collection', {
      collection: collection,
    });
  };
};

const Item = ({collection}: Props) => {
  const {user: bibliUser} = useContext(UserContext);
  const {usersApi} = useContext(ApiContext);
  const booksCount = `${collection.count ?? 0} Books`;
  const [subtitle, setSubtitle] = useState<string>(booksCount);

  const ownerLinks = collection.user_links.filter(
    link => link.type === CollectionUserLinkType.Owner,
  );

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const userPromises = ownerLinks.map(async link => {
          if (link.user_id === bibliUser?.id) {
            return bibliUser?.name;
          } else {
            const response = await usersApi.getUserByIdUserUserIdGet(
              link.user_id,
            );
            return response.data.name;
          }
        });
        const names = await Promise.all(userPromises);
        if (names && names.length > 0) {
          setSubtitle(`${booksCount} • ${names.join(', ')}`);
        }
      } catch (error) {
        console.error('Error fetching user names:', error);
      }
    };

    fetchUserNames().catch(e => console.log(e));
  }, [bibliUser?.id, bibliUser?.name, booksCount, ownerLinks, usersApi]);

  return (
    <Card
      mode={'contained'}
      style={styles.container}
      onPress={CardPress(collection)}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={collection.name}
        titleVariant={'titleMedium'}
        subtitle={subtitle}
        subtitleStyle={{
          fontWeight: '300',
        }}
        left={props => <Avatar.Icon {...props} icon="book" />}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 2,
  },
});

export default Item;
