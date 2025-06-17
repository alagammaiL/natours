import '@babel/polyfill';
import loginFunction from './login';
import logoutFunction from './logout';
import { updateUserData } from './updateData';
import { bookTour } from './stripe';
// console.log('updateData');
const logInForm = document.querySelector('.form--login');
const logout = document.querySelector('.nav__el--logout');
const updateData = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-settings');
const bookTourButton = document.getElementById('book_tour');
//values
// console.log('updateData');
if (logInForm) {
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // console.log(email, password);
    loginFunction(email, password);
  });
}
if (updateData) {
  // console.log('ehy');
  updateData.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('photo', document.getElementById('photo').files[0]);
    // console.log('hello', document.getElementById('photo').files[0]);
    updateUserData(formData, 'userData');
  });
}
if (updatePassword) {
  updatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--loading').textContent = 'loading password';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserData(
      { password, currentPassword, passwordConfirm },
      'password',
    );
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--loading').textContent = 'save password';
  });
}
if (logout) {
  logout.addEventListener('click', logoutFunction);
}
if (bookTourButton) {
  bookTourButton.addEventListener('click', (e) => {
    e.target.textContent = 'processing....';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
