import { ViewStyle, TextStyle } from 'react-native';

export interface Customer {
  name?: string;
  email: string;
  phonenumber?: string;
}

export interface Customizations {
  title?: string;
  logo?: string;
  description?: string;
}

export interface SubAccount {
  account_bank: string;
  account_number: string;
  business_name: string;
  business_mobile: string;
  country: string;
  split_type: string;
  split_value: number;
}

export type statusType =
  | 'cancelled'
  | 'successful'
  | 'completed'
  | 'aborted'
  | 'unknown';
export interface Styles {
  modal: ViewStyle;
  activity: ViewStyle;
  content: ViewStyle;
  WebView: ViewStyle;
  closer: ViewStyle;
  closerText: TextStyle;
  mainContent?: ViewStyle;
}
type currencyTypes =
  | 'NGN'
  | 'US'
  | 'EUR'
  | 'GBP'
  | 'GHS'
  | 'XAF'
  | 'XOF'
  | 'ZAR'
  | 'MWK'
  | 'KES'
  | 'RWF'
  | 'UGX'
  | 'TZS';

export interface ReturnObject {
  status: statusType;
  tx_ref: string;
  txRef?: string;
  transaction_id?: string;
  message?: string;
}

export const paymentTypes = [
  'card',
  'ussd',
  'account',
  'banktransfer',
  'credit',
  'nqr',
  'barter',
  'mobilemoneyzambia',
  'mobilemoneyrwanda',
  'mobilemoneyfranco',
  'mobilemoneyghana',
  'mobilemoneyuganda',
  'googlepay',
  'mpesa',
  'applepay',
  'internetbanking',
  'enaira',
  'opay',
];

export interface PaymentProp {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency?: currencyTypes;
  redirect_url?: string;
  onSuccess: (success: ReturnObject) => void;
  onFailure: (failure: ReturnObject) => void;
  onCancel: (cancel: ReturnObject) => void;
  customer: Customer;
  max_retry_attempt?: number;
  customizations?: Customizations;
  meta?: object;
  payment_plan?: string;
  subaccounts?: SubAccount[];
  payment_options?: string;
}
