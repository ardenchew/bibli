import {DefaultTheme, Theme} from '@react-navigation/native';
import {LightTheme} from './LightTheme';

export const NavigationLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // primary: LightTheme.colors.primary,
    background: LightTheme.colors.background,
    // card: LightTheme.colors.surfaceVariant,
    // text: LightTheme.colors.scrim,
    // border: LightTheme.colors.outline,
    // notification: LightTheme.colors.error,
  },
};
