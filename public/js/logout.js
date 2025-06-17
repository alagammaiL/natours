import axios from 'axios';

async function logoutFunction() {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/v1/users/log-out',
    });
    // console.log(response);
    if (response.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'error logging out please try again later');
  }
}
module.exports = logoutFunction;
