import * as React from 'react';
import {Avatar, Card, IconButton, Menu} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';
import {UserRead} from '../../generated/jericho';
import {useState} from 'react';
import {useLogout} from './Logout';

interface Props {
  style: StyleProp<ViewStyle>;
  user: UserRead;
  isCurrentUser: boolean;
}

const MenuButton = ({isCurrentUser}: {isCurrentUser: boolean}) => {
  const handleLogout = useLogout();
  const [visible, setVisible] = useState<boolean>(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return isCurrentUser ? (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<IconButton icon="dots-horizontal" onPress={openMenu} />}>
      {isCurrentUser && (
        <Menu.Item
          leadingIcon={'logout'}
          onPress={handleLogout}
          title="Log out"
          theme={{
            colors: {
              onSurface: 'red',
              onSurfaceVariant: 'red',
            },
          }}
        />
      )}
    </Menu>
  ) : (
    <></>
  );
};

export const Title = ({style, user, isCurrentUser}: Props) => {
  return (
    <>
      <Card.Title
        style={style}
        title={user?.name}
        titleVariant={'headlineMedium'}
        subtitle={`@ ${user?.tag}`}
        subtitleVariant={'labelLarge'}
        left={props => <Avatar.Icon {...props} icon="account" />}
        right={() => <MenuButton isCurrentUser={isCurrentUser} />}
      />
    </>
  );
};
