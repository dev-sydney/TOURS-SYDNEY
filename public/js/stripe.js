import axios from 'axios';
import { showAlerts } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51KtrcXHQab9KuPl1G2BMVNDuxLxGrHHbuc3J5pV4DGp4xDyPIsoHlOt6yPS1x5daGEE27ohGCgMgURVKi0lrY62X00z8pRRVXq'
    );

    //TODO: //1. Get the checkout session from the API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    //console.log(session);
    //TODO: //2. use the global stripe checkout object to create a checkout form + credit card charge
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlerts('error', err);
  }
};
