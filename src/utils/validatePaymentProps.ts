import { paymentTypes, PaymentProp } from '../types/PaymentProp';

export const validatePaymentProp = (payment: PaymentProp): boolean => {
  // Basic validation rules
  // if the currency valus are not from the array, terminate
  const options = payment.payment_options?.split(',');
  if (options?.length) {
    let donotexists = false;
    options.forEach((value) => {
      if (paymentTypes.indexOf(value) < 0) {
        donotexists = true;
      }
    });

    return donotexists;
  }

  if (!payment.tx_ref || !payment.amount || !payment.customer.email) {
    return false;
  }
  // More validation logic can be added here
  return true;
};
