import { StyleSheet, Platform } from 'react-native';
import { Styles } from '../types/PaymentProp';

export default function useStyle(): Styles {
  return StyleSheet.create<Styles>({
    modal: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      zIndex: 999,
    },
    activity: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      zIndex: 9999,
    },
    mainContent: {
      flex: 1,
      backgroundColor: '#fff',
    },
    content: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 0,
      minWidth: '100%',
      minHeight: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    WebView: {
      backgroundColor: '#fff',
      flex: 1,
    },
    closer: {
      width: 35,
      height: 35,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      alignSelf: 'flex-end',
      zIndex: 9999,
      backgroundColor: '#f9f9f9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      right: 15,
      top: Platform.OS === 'ios' ? 45 : 15,
      borderRadius: 25,
    },
    closerText: {
      color: 'red',
      maxWidth: 40,
      textAlign: 'center',
    },
  });
}
