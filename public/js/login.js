import axios from 'axios';
import { showAlert } from './alert';
async function loginFunction(email, password) {
  // console.log(email, password, 'login');
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/sign-in',
      data: {
        email: email,
        password: password,
      },
    });
    // console.log(response);
    if (response.data.status === 'success') {
      showAlert('success', 'login success');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}
module.exports = loginFunction;
