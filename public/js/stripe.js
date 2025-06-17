import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51RZnSHAIj4yb6EHXKL3bfJExhXRIK2eLuWlizHvPormJQQl6a7dsRNVTb2nXNv5ilPDaSxO1NDaVKGwFk4y2Fevs006Qss5exN',
);
export const bookTour = async (tourId) => {
  try {
    //1)get the session from the server as api
    const getSession = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );
    // console.log(getSession);
    //2)create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: getSession.data.session.id,
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', err);
  }
};
