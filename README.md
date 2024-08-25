# flw-react-native-lite

Simple lightweight payment module for Flutterwave payment system in a react-native application, fast and robust

## Installation

```sh
npm install flw-react-native-lite
```

## Dependency

This package requires ` react-native-webview@13.8.6`, and is best suited with Typescript based react-native applications.

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
    public_key: "Your public key", // required (https://flutterwavedoc.readme.io/v2.0/docs/api-keys)
    tx_ref: "TX12345"+Math.floor(((Math.random() + 1) * 1324600075)).toString(), //  required
    amount: 1000, // required
    currency: "NGN", // Required
    redirect_url: "https://www.google.com/", // optional callback url in case you need one
    onSuccess: (response:ReturnObject) => { // required
      console.log(response, "21");// {status: 'successful' | 'completed', tx_rf: "ref", transaction_id: '12345'}
      setPaymentVisible(false);
    },
    onFailure: (response:ReturnObject) => { // required to handle failures
      console.log(response, "25"); // {status: 'aborted' | 'unknown', tx_rf: "ref", transaction_id: ''}
      setPaymentVisible(false);
    },
    onCancel: (response:ReturnObject) =>{ // required to handle cancel event
      setPaymentVisible(false); // {status: 'cancelled', tx_rf: "ref", transaction_id: ''}
      console.log(response, "21");
    },
    customer: {
      email: "customer_email@gmail.com", // required
      phonenumber: "+2349034313680", // optional
      name: "Cuatomer_name" // optional
    },
    customizations: { // optional
      title: 'your business name', // optional
      description: 'You are paying businessname', // optional
      logo: 'https://example.com/logo.png' // optional
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

## Custom Support

For custom support, send an email to me at [nickmberev[at]gmail.com](mailto:nickmberev@gmail.com)

## License

MIT

Free for distribution.

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
