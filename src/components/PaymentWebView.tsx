import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { PaymentProp, ReturnObject, statusType } from '../types/PaymentProp';
import useStyle from '../hooks/useStyle';

interface PaymentWebViewProps {
  payment: PaymentProp;
  isVisible: boolean;
}

const PaymentWebView: React.FC<PaymentWebViewProps> = ({
  payment,
  isVisible,
}) => {
  const styles = useStyle();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string | null>(null);

  const handleNavigationStateChange = (navState: any) => {
    try {
      const rdr = payment?.redirect_url || 'https://google.com';
      if (navState.url.includes(rdr)) {
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
          payment.onSuccess(actionResult);
        }

        if (actionResult.status === 'cancelled') {
          payment?.onCancel(actionResult);
        }

        if (
          actionResult.status === 'aborted' ||
          actionResult.status === 'unknown'
        ) {
          payment?.onFailure(actionResult);
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
      const urlObj = url.split('?')[1];
      const params = new URLSearchParams(urlObj);
      const status = params.get('status') as statusType;
      const txRef = params.get('tx_ref');
      const transactionId = params.get('transaction_id');
      if (status) rObject.status = status;
      if (txRef) rObject.tx_ref = txRef;
      if (transactionId) rObject.transaction_id = transactionId;
      return rObject;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return {
        status: 'aborted' as statusType,
        tx_ref: '',
        transaction_id: '',
        message: JSON.stringify(url) + ' | ' + JSON.stringify(error),
      };
    }
  };

  const startPaymentProcessing = useCallback(async () => {
    try {
      const rdr = payment?.redirect_url || 'https://google.com';
      const paymentInfo = {
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
        redirect_url: rdr,
        meta: payment.meta,
        payment_plan: payment.payment_plan,
        subaccounts: payment.subaccounts,
        payment_options: payment.payment_options,
        configuration: {
          max_retry_attempt: payment.max_retry_attempt,
        },
      };
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
          mode: 'no-cors',
          body: JSON.stringify(paymentInfo),
        }
      );
      if (!getHtml.ok) {
        if (html) setHtml(null);
        Alert.alert('Error', 'Payment initialization failed.', [
          {
            text: 'Try again',
            onPress: () => startPaymentProcessing(),
          },
        ]);
        return;
      }
      const response = await getHtml.text();
      console.log(144);
      setHtml(response);
    } catch (error) {
      console.log(error, 147);
    }
  }, [payment, html]);

  useEffect(() => {
    console.log(isVisible, ' ', 'html to be used');
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
          if (typeof payment.onCancel === 'function') {
            payment.onCancel({
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
      animationType="slide"
      style={[styles.modal]}
    >
      <SafeAreaView style={[styles.mainContent]}>
        {!loading && (
          <TouchableOpacity
            onPress={() => cacelProcess()}
            style={styles.closer}
          >
            <Text style={styles.closerText}>✖</Text>
          </TouchableOpacity>
        )}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.activity}
          />
        )}
        {typeof html === 'string' && (
          <WebView
            style={[styles.WebView]}
            ref={webViewRef}
            source={{ html }}
            originWhitelist={['*']}
            mixedContentMode="always"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            startInLoadingState={Platform.OS === 'android'}
            setSupportMultipleWindows={false}
            mediaPlaybackRequiresUserAction={false}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            webviewDebuggingEnabled={true}
            dataDetectorTypes="all"
            onLoadStart={() => {
              if (!loading) setLoading(true);
            }}
            onLoadEnd={() => {
              if (loading) setLoading(false);
            }}
            onNavigationStateChange={handleNavigationStateChange}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              payment.onFailure({
                status: 'aborted',
                tx_ref: '',
                transaction_id: '',
                message: nativeEvent?.description,
              });
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
              payment.onFailure({
                status: 'aborted',
                tx_ref: '',
                transaction_id: '',
                message: nativeEvent?.description,
              });
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default PaymentWebView;
