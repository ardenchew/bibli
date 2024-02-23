import {Button} from 'react-native-paper';
import * as React from 'react';
import {StyleProp, ViewStyle, View, StyleSheet, TextStyle} from 'react-native';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {
  CollectionRead,
  CollectionsApi,
  CollectionUserLinkType,
  UserRead,
} from '../../generated/jericho';

interface ProfileButtonProps {
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  link?: CollectionUserLinkType;
  setLink?: Dispatch<SetStateAction<CollectionUserLinkType | null>>;
  collection?: CollectionRead;
  bibliUser?: UserRead;
  collectionsApi?: CollectionsApi;
}

const OwnerButton = ({style, labelStyle}: ProfileButtonProps) => {
  return (
    <Button
      mode={'text'}
      compact={true}
      icon={'key-variant'}
      style={style}
      labelStyle={labelStyle}>
      Owner
    </Button>
  );
};

const CollaboratorButton = ({style, labelStyle}: ProfileButtonProps) => {
  return (
    <Button
      mode={'text'}
      compact={true}
      icon={'account-edit-outline'}
      style={style}
      labelStyle={labelStyle}>
      Collaborator
    </Button>
  );
};

const FollowerButton = ({
  style,
  labelStyle,
  collection,
  setLink,
  bibliUser,
  collectionsApi,
}: ProfileButtonProps) => {
  const onPress = async () => {
    if (!collectionsApi || !setLink || !collection || !bibliUser) {
      return null;
    }

    try {
      await collectionsApi.deleteCollectionUserLinkCollectionUserLinkCollectionIdUserIdDelete(
        collection?.id,
        bibliUser?.id,
      );
      setLink(null);
    } catch (error) {
      console.error('Error deleting collection user link: ', error);
    }
  };

  return (
    <Button
      mode={'contained'}
      compact={true}
      icon={'account-check-outline'}
      style={style}
      labelStyle={labelStyle}
      onPress={onPress}>
      Following
    </Button>
  );
};

const FollowButton = ({
  style,
  labelStyle,
  collection,
  setLink,
  bibliUser,
  collectionsApi,
}: ProfileButtonProps) => {
  const onPress = async () => {
    if (!collectionsApi || !setLink || !collection || !bibliUser) {
      return null;
    }

    try {
      const response =
        await collectionsApi.putCollectionUserLinkCollectionUserLinkPut({
          collection_id: collection?.id,
          user_id: bibliUser?.id,
          type: CollectionUserLinkType.Follower,
        });
      setLink(response.data.type);
    } catch (error) {
      console.error('Error deleting collection user link: ', error);
    }
  };

  return (
    <Button
      mode={'outlined'}
      compact={true}
      icon={'account-plus'}
      style={style}
      labelStyle={labelStyle}
      onPress={onPress}>
      Follow
    </Button>
  );
};

interface Props {
  style?: StyleProp<ViewStyle>;
  collection: CollectionRead;
  collectionsApi: CollectionsApi;
  bibliUser: UserRead;
}

// Profile button container - dynamically allow for different profile buttons.
export const TitleButtons = ({
  style,
  collection,
  collectionsApi,
  bibliUser,
}: Props) => {
  const [link, setLink] = useState<CollectionUserLinkType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (bibliUser) {
        try {
          const response =
            await collectionsApi.getCollectionUserLinkCollectionUserLinkCollectionIdUserIdGet(
              collection.id,
              bibliUser?.id,
            );
          setLink(response.data ? response.data.type : null);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };

    fetchUser().catch(error => console.log(error));
  }, [bibliUser, collection.id, collectionsApi]);

  return (
    <View style={style}>
      <View style={styles.container}>
        {link === CollectionUserLinkType.Owner && <OwnerButton style={style} />}
        {link === CollectionUserLinkType.Collaborator && (
          <CollaboratorButton style={style} />
        )}
        {link === CollectionUserLinkType.Follower && (
          <FollowerButton
            style={[style, {marginBottom: 5}]}
            collection={collection}
            setLink={setLink}
            bibliUser={bibliUser ?? undefined}
            collectionsApi={collectionsApi}
          />
        )}
        {link === null && (
          <FollowButton
            style={[style, {marginBottom: 5}]}
            collection={collection}
            setLink={setLink}
            bibliUser={bibliUser ?? undefined}
            collectionsApi={collectionsApi}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  profileBanner: {
    flex: 1,
  },
});
