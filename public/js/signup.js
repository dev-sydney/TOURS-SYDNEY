import { showAlerts } from './alerts';
import axios from 'axios';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    //console.log(res);

    if (res.data.status === 'success') {
      showAlerts('success', `Hey ${name.split(' ')[0]} your'e welcome!`);

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // console.error(err);
    showAlerts('error', err);
  }
};
