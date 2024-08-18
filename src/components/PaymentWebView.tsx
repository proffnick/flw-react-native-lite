import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import WebView from 'react-native-webview';
import { PaymentProp, ReturnObject, statusType } from '../types/PaymentProp';

interface PaymentWebViewProps {
  payment: PaymentProp;
  isVisible: boolean;
}

const PaymentWebView: React.FC<PaymentWebViewProps> = ({
  payment,
  isVisible,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string | null>(null);
  const statusBarHeight = StatusBar.currentHeight || 0;

  const handleNavigationStateChange = (navState: any) => {
    try {
      if (navState.url.includes(payment.redirect_url)) {
        if (webViewRef.current) {
          if (webViewRef.current.clearCache)
            webViewRef.current.clearCache(true);
          if (webViewRef.current.clearHistory)
            webViewRef.current.clearHistory();
          webViewRef.current.stopLoading();
        }
        const actionResult: ReturnObject = getActionResult(navState.url);
        if (
          actionResult.status === 'successful' ||
          actionResult.status === 'completed'
        ) {
          payment.on_success(actionResult);
        }

        if (actionResult.status === 'cancelled') {
          payment?.on_cancel(actionResult);
        }

        if (
          actionResult.status === 'aborted' ||
          actionResult.status === 'unknown'
        ) {
          payment?.on_failure(actionResult);
        }

        setHtml(null);
        // Close the modal or WebView
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getActionResult = (url: string = 'https://google.com') => {
    try {
      const rObject: ReturnObject = {
        status: 'unknown',
        tx_ref: '',
        transaction_id: '',
      };
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      const status = params.get('status') as statusType;
      const txRef = params.get('tx_ref');
      const transactionId = params.get('transaction_id');
      if (status) rObject.status = status;
      if (txRef) rObject.tx_ref = txRef;
      if (transactionId) rObject.transaction_id = transactionId;
      return rObject;
    } catch (error) {
      return {
        status: 'aborted' as statusType,
        tx_ref: '',
        transaction_id: '',
      };
    }
  };

  const startPaymentProcessing = useCallback(async () => {
    try {
      const getHtml = await fetch(
        'https://checkout.flutterwave.com/v3/hosted/pay',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept':
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://checkout.flutterwave.com/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          body: JSON.stringify({
            public_key: payment.public_key,
            tx_ref: payment.tx_ref,
            amount: payment.amount,
            currency: payment.currency || 'NGN',
            customer: {
              email: payment.customer.email,
              phonenumber: payment.customer.phonenumber,
              name: payment.customer.name,
            },
            customizations: payment.customizations,
            redirect_url: payment.redirect_url || 'https://google.com',
            meta: payment.meta,
            payment_plan: payment.payment_plan,
            subaccounts: payment.subaccounts,
            payment_options: payment.payment_options,
            configuration: {
              max_retry_attempt: payment.max_retry_attempt,
            },
          }),
        }
      );

      if (!getHtml.ok) {
        setHtml(null);
        Alert.alert('Error', 'Payment initialization failed.', [
          {
            text: 'Try again',
            onPress: () => startPaymentProcessing(),
          },
        ]);
        return;
      }
      const response = await getHtml.text();
      setHtml(response);
    } catch (error) {
      console.log(error);
    }
  }, [payment]);

  useEffect(() => {
    if (isVisible && !html) {
      startPaymentProcessing();
    }
  }, [isVisible, startPaymentProcessing, html]);

  const cacelProcess = () => {
    Alert.alert('Conform', 'Are you sure you want to cancel payment?', [
      {
        text: 'YES',
        onPress: () => {
          if (webViewRef.current) {
            setHtml(null);
          }

          if (typeof payment.on_cancel === 'function') {
            payment.on_cancel({
              status: 'cancelled',
              tx_ref: '',
              transaction_id: '',
            });
          }
        },
      },
      {
        text: 'NO',
      },
    ]);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      style={[Styles.modal, { top: statusBarHeight }]}
    >
      <View style={[Styles.content]}>
        {!loading && (
          <TouchableOpacity
            onPress={() => cacelProcess()}
            style={Styles.closer}
          >
            <Text style={Styles.closerText}>✖</Text>
          </TouchableOpacity>
        )}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={Styles.activity}
          />
        )}
        {html && (
          <WebView
            style={[Styles.WebView]}
            ref={webViewRef}
            source={{ html: html }}
            originWhitelist={['*']}
            mixedContentMode="always"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadStart={() => setLoading(true)}
            onLoadProgress={({ nativeEvent }) => {
              console.log(nativeEvent.progress, 'loging progress');
              // setProgress(nativeEvent.progress);
            }}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              payment.on_failure({
                status: 'aborted',
                tx_ref: '',
                transaction_id: '',
              });
            }}
            onShouldStartLoadWithRequest={(request) => {
              // request.url.startsWith('https://reactnative.dev')
              const furl = 'https://checkout.flutterwave.com';
              const furl2 = 'https://flutterwave.com';
              const furl3 = payment.redirect_url || 'https://google.com';
              return (
                request.url.startsWith(furl) ||
                request.url.startsWith(furl2) ||
                request.url.startsWith(furl3)
              );
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
              payment.on_failure({
                status: 'aborted',
                tx_ref: '',
                transaction_id: '',
              });
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const Styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  activity: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 99,
  },
  content: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 15,
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
    width: '100%',
    height: '100%',
  },
  closer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    alignSelf: 'flex-end',
    zIndex: 999,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    right: 5,
    top: StatusBar.currentHeight || 15,
    borderRadius: 25,
  },
  closerText: {
    color: 'red',
    maxWidth: 40,
    textAlign: 'center',
  },
});

export default PaymentWebView;
