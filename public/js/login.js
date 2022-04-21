import axios from 'axios';
import { showAlerts } from './alerts';

export const login = async (email, password) => {
  // console.log({ email, password });
  //res - resolved variable
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    //if logging into the app was a sucess,send an alert
    // if (res.data.status === 'Success'.toLowerCase()) {
    //   alert('Logged In Successfully!');
    //   //And Then after open the home-page after 1.5sec (This will cause a reload)
    //   window.setTimeout(() => {
    //     location.assign('/');
    //   }, 1500);
    // }

    if (res.data.status === 'success') {
      showAlerts('success', 'Logged In Successfully !');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    // console.log(res);
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
};

export const logoutUser = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlerts('error', 'Error Logging out! Try again');
  }
};
