let countDownTime = 10;
let intervalId = null;

/**
 * Sanitizes a potentially unsafe URL to prevent XSS in hrefs.
 * Returns the URL if it is safe (starts with '/', './', 'http://', or 'https://'),
 * otherwise returns '#' as a safe fallback.
 */
function sanitizeUrl(url) {
  if (
    typeof url === 'string' &&
    (url.startsWith('/') || url.startsWith('./') || url.startsWith('http://') || url.startsWith('https://'))
  ) {
    return url;
  }
  // Anything else is potentially dangerous
  return '#';
}

function updateTimer() {
  document.getElementById('timer').innerText = countDownTime;
}

function refreshFragment() {
  const fragmentElement = document.querySelector('#build_fragment');
  fetch(sanitizeUrl(fragmentElement.dataset.refreshUrl))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      return response.text();
    })
    .then((text) => {
      fragmentElement.innerHTML = text;
      const buildStatus = document.getElementById('action-button').dataset.buildStatus;
      if (buildStatus === 'completed' || buildStatus === 'failed') {
        clearInterval(intervalId);
      } else {
        updateTimer();
        document.getElementById('build-status-message-failed').setAttribute('hidden', '');
        document.getElementById('action-button').style.visibility = 'hidden';
        document.getElementById('build-status-message').removeAttribute('hidden');
      }
    })
    .catch((error) => {
      console.log(error);
      document.getElementById('build-status-message').setAttribute('hidden', '');
      document.getElementById('action-button').style.visibility = 'visible';
      document.getElementById('build-status-message-failed').removeAttribute('hidden');
      clearInterval(intervalId);
    });
}

function checkBuildStatus() {
  if (countDownTime > 0) {
    updateTimer();
    countDownTime--;
  } else {
    refreshFragment();
    countDownTime = 10;
  }
}

refreshFragment();

intervalId = setInterval(checkBuildStatus, 1000);
