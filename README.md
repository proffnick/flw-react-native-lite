# flw-react-native-lite

Simple lightweight payment module for Flutterwave payment system in a react-native application, fast and robust

## Installation

```sh
npm install flw-react-native-lite
```

## Usage

```js
import {
  FLWReactNativeLite,
  PaymentProp,
  validatePaymentProp,
  ReturnObject
  } from 'flw-react-native-lite';

// ...

const App = () => {
  const [isPaymentVisible, setPaymentVisible] = useState(false);

  // Define the payment details as per the PaymentProp interface
  const paymentDetails: PaymentProp = {
    public_key: "Your public key",
    tx_ref: "TX12345"+Math.floor(((Math.random() + 1) * 1324600075)).toString(),
    amount: 1000,
    currency: "NGN",
    redirect_url: "https://www.google.com/",
    on_success: (response:ReturnObject) => {
      console.log(response, "21");// {status: 'successful' | 'completed', tx_rf: "ref", transaction_id: '12345'}
      setPaymentVisible(false);
    },
    on_failure: (response:ReturnObject) => {
      console.log(response, "25");
      setPaymentVisible(false);
    },
    on_cancel: (response:ReturnObject) =>{
      setPaymentVisible(false);
      console.log(response, "21");
    },
    customer: {
      email: "customer_email@gmail.com",
      phonenumber: "+2349034313680",
      name: "Cuatomer_name"
    },
    customizations: {
      title: 'your business name',
      description: 'You are paying businessname',
      logo: 'https://example.com/logo.png'
    }
  };

  // Validate the payment details
  const isValidPayment = validatePaymentProp(paymentDetails);

  const initiatePayment = () => {
    if (isValidPayment) {
      setPaymentVisible(true);
    } else {
      console.log('Invalid payment details', 'Invalid payment details');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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

export default App;
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
