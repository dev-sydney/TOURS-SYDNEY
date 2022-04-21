export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

/**
 *
 * @param {String} type  Could be either "success" or "error"
 * @param {String} msg
 */
export const showAlerts = (type, msg) => {
  hideAlert();

  const htmlmarkUp = `<div class="alert alert--${type}">${msg}</div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', htmlmarkUp);

  window.setTimeout(hideAlert, 5000);
};
