import axios from 'axios';
import { showAlert } from './alert';
export const updateUserData = async (data, type) => {
  console.log('hello');
  let url =
    type === 'password'
      ? '/api/v1/users/update-password'
      : '/api/v1/users/updateMe';
  // console.log(data);
  try {
    const response = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (response.data.status === 'success') {
      showAlert('success', 'update');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
