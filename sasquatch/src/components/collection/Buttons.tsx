import {Button} from 'react-native-paper';
import * as React from 'react';
import {StyleProp, ViewStyle, View, StyleSheet} from 'react-native';
import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import {
  CollectionRead,
  CollectionUserLinkType,
  UserRead,
} from '../../generated/jericho';
import {ApiContext} from '../../context';

interface ProfileButtonProps {
  style?: StyleProp<ViewStyle>;
  link?: CollectionUserLinkType;
  setLink?: Dispatch<SetStateAction<CollectionUserLinkType | undefined>>;
  collection?: CollectionRead;
  bibliUser?: UserRead;
}

const OwnerButton = ({style}: ProfileButtonProps) => {
  return (
    <Button
      mode={'text'}
      compact={true}
      icon={'key-variant'}
      style={style}
      labelStyle={styles.buttonLabelStyle}>
      Owner
    </Button>
  );
};

const CollaboratorButton = ({style}: ProfileButtonProps) => {
  return (
    <Button
      mode={'text'}
      compact={true}
      icon={'account-edit-outline'}
      style={style}
      labelStyle={styles.buttonLabelStyle}>
      Collaborator
    </Button>
  );
};

const FollowerButton = ({
  style,
  collection,
  setLink,
  bibliUser,
}: ProfileButtonProps) => {
  const {collectionsApi} = useContext(ApiContext);
  const onPress = async () => {
    if (!setLink || !collection || !bibliUser) {
      return null;
    }

    try {
      await collectionsApi.deleteCollectionUserLinkCollectionUserLinkCollectionIdUserIdDelete(
        collection?.id,
        bibliUser?.id,
      );
      setLink(undefined);
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
      labelStyle={styles.buttonLabelStyle}
      onPress={onPress}>
      Following
    </Button>
  );
};

const FollowButton = ({
  style,
  collection,
  setLink,
  bibliUser,
}: ProfileButtonProps) => {
  const {collectionsApi} = useContext(ApiContext);
  const onPress = async () => {
    if (!setLink || !collection || !bibliUser) {
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
      labelStyle={styles.buttonLabelStyle}
      onPress={onPress}>
      Follow
    </Button>
  );
};

interface Props {
  style?: StyleProp<ViewStyle>;
  collection: CollectionRead;
  bibliUser: UserRead;
}

// Profile button container - dynamically allow for different profile buttons.
export const TitleButtons = ({style, collection, bibliUser}: Props) => {
  const {collectionsApi} = useContext(ApiContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [link, setLink] = useState<CollectionUserLinkType | undefined>();

  useEffect(() => {
    const fetchUser = async () => {
      if (bibliUser) {
        try {
          const response =
            await collectionsApi.getCollectionUserLinkCollectionUserLinkCollectionIdUserIdGet(
              collection.id,
              bibliUser?.id,
            );
          setLink(response.data ? response.data.type : undefined);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user:', error);
          setLoading(false);
        }
      }
    };

    fetchUser().catch(error => console.log(error));
  }, [bibliUser, collection.id, collectionsApi]);

  return loading ? null : (
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
          />
        )}
        {!link && (
          <FollowButton
            style={[style, {marginBottom: 5}]}
            collection={collection}
            setLink={setLink}
            bibliUser={bibliUser ?? undefined}
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
  buttonLabelStyle: {
    marginVertical: 5,
  },
});
