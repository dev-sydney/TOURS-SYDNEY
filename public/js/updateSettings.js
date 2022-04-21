import axios from 'axios';
import { showAlerts } from './alerts';

export const updateData = async (email, name) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: {
        email,
        name,
      },
    });
    if (res.data.status === 'success') {
      showAlerts('success', 'Data updated successfully!');
    }
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
};
/**
 *
 * @param {object} data  An Object of all the data to be updated
 * @param {string} type could be either "data" or "password"
 */
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlerts('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
};
