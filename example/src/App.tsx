import { useState } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import {
  FLWReactNativeLite,
  PaymentProp,
  validatePaymentProp,
  ReturnObject,
} from 'flw-react-native-lite';
import useMessage from './hooks/useMessage';

const App = () => {
  const [isPaymentVisible, setPaymentVisible] = useState(false);
  const { showMessage } = useMessage();

  // Define the payment details as per the PaymentProp interface
  // FLWPUBK_TEST-2c765c23876cc845b077f1504e3e715e-X // TEST
  // FLWPUBK-e7df4e140e9dd7add0ccf71429683900-X
  const paymentDetails: PaymentProp = {
    public_key: 'FLWPUBK-e7df4e140e9dd7add0ccf71429683900-X',
    tx_ref: 'TX12345' + Math.floor((Math.random() + 1) * 1324600075).toString(),
    amount: 200,
    currency: 'NGN',
    redirect_url: 'https://example.com/',
    onSuccess: (response: ReturnObject) => {
      showMessage('Payment Successful', 'Payment Successful');
      console.log(response, '21');
      setPaymentVisible(false);
    },
    onFailure: (response: ReturnObject) => {
      showMessage('Payment Failed', 'Payment Failed');
      console.log(response, '25');
      setPaymentVisible(false);
    },
    onCancel: (response: ReturnObject) => {
      setPaymentVisible(false);
      console.log(response, '21');
      showMessage('Payment Cancelled', 'Payment Cancelled');
    },
    customer: {
      email: 'example@gmail.com',
      phonenumber: '+234903431300',
      name: 'Mberev Nicholas',
    },
    customizations: {
      title: 'Pay MeterToken',
      description: 'You are paying MeterToken',
      logo: 'https://metertoken.ng/logo.png',
    },
    meta: {
      token: Math.floor((Math.random() + 1) * 1324600095).toString(),
    },
  };

  // Validate the payment details
  const isValidPayment = validatePaymentProp(paymentDetails);

  const initiatePayment = () => {
    if (isValidPayment) {
      setPaymentVisible(true);
    } else {
      showMessage('Invalid payment details', 'Invalid payment details');
    }
  };

  return (
    <View style={styles.main}>
      <Button title="Pay Now" onPress={initiatePayment} />
      {isPaymentVisible && (
        <FLWReactNativeLite
          payment={paymentDetails}
          isVisible={isPaymentVisible}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
