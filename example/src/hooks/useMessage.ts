import { Alert } from 'react-native';
export default function useMessage() {
  return {
    showMessage: (
      message: string = '',
      title: string = '',
      buttonText: string = 'Ok',
      cancelButtonText: string = 'cancel',
      action: any = () => null
    ) => {
      Alert.alert(title, message, [
        {
          text: buttonText,
          onPress: action ? action : () => null,
        },
        {
          text: cancelButtonText,
        },
      ]);
    },
  };
}
