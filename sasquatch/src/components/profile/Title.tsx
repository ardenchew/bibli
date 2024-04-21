import * as React from 'react';
import {Avatar, Card, IconButton, Menu} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';
import {UserRead} from '../../generated/jericho';
import {useState} from 'react';
import {useLogout} from './Logout';
import {UserAvatar, UserAvatarCallback} from './Avatar';
import {LightTheme} from '../../styles/themes/LightTheme';

interface Props {
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
              onSurface: 'firebrick',
              onSurfaceVariant: 'firebrick',
            },
          }}
        />
      )}
    </Menu>
  ) : (
    <></>
  );
};

export const Title = ({user, isCurrentUser}: Props) => {
  const left = UserAvatarCallback({user, size: 70});
  const right = () => <MenuButton isCurrentUser={isCurrentUser} />;
  return (
    <Card
      mode={'contained'}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.onPrimary},
      }}
      style={{margin: 10}}>
      <Card.Title
        // leftStyle={{borderWidth: 1, width: 80, height: 80}}
        title={user?.name}
        titleVariant={'headlineMedium'}
        subtitle={`@${user?.tag}`}
        subtitleVariant={'labelLarge'}
        left={left}
        leftStyle={{
          borderWidth: 1,
          alignItems: 'center',
          marginRight: 30,
        }}
        right={right}
      />
    </Card>
  );
};
