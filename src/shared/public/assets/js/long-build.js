const datasetId = document.getElementById('dataset-id').value;
const buildId = document.getElementById('build-id').value;
const nextAction = document.getElementById('next-action').value;
const previousAction = document.getElementById('previous-action').value;
const translations = JSON.parse(document.getElementById('translation-keys').value);
const lang = document.getElementById('lang').value;
let countDownTime = 10;
let status = 'building';
let intervalId = null;

/**
 * Sanitizes a potentially unsafe URL to prevent XSS in hrefs.
 * Returns the URL if it is safe (starts with '/', './', 'http://', or 'https://'),
 * otherwise returns '#' as a safe fallback.
 */
function sanitizeUrl(url) {
  if (
    typeof url === 'string' &&
    (url.startsWith('/') ||
      url.startsWith('./') ||
      url.startsWith('http://') ||
      url.startsWith('https://'))
  ) {
    return url;
  }
  // Anything else is potentially dangerous
  return '#';
}

async function fetchBuildStatusAndUpdate() {
  const buildLogEntry = await fetch(`/${lang}/publish/${datasetId}/build/${buildId}/refresh`).then((response) =>
    response.json()
  );
  status = buildLogEntry.status;
  switch (status) {
    case 'materializing':
    case 'completed':
      document.getElementById('build-status-heading').innerText = translations.title.completed;
      document.getElementById('build-status-message').innerText = translations.message.completed;
      document.getElementById('action-button').href = sanitizeUrl(nextAction);
      document.getElementById('action-button').innerText = translations.buttons.continue;
      document.getElementById('spinner').style.visibility = 'hidden';
      document.getElementById('action-button').style.visibility = 'visible';
      clearInterval(intervalId);
      return;
    case 'failed':
      document.getElementById('build-status-heading').innerText = translations.title.failed;
      document.getElementById('build-status-message').innerText = translations.message.failed;
      document.getElementById('action-button').href = sanitizeUrl(previousAction);
      document.getElementById('action-button').innerText = translations.buttons.back;
      document.getElementById('action-button').style.visibility = 'visible';
      clearInterval(intervalId);
      return;
    default:
      document.getElementById('build-status-heading').innerText = translations.title.building;
      document.getElementById('build-status-message').innerHTML = translations.message.building.replace(
        '%time%',
        countDownTime
      );
  }
}

function checkBuildStatus() {
  if (countDownTime > 0) {
    document.getElementById('build-status-message').innerHTML = translations.message.building.replace(
      '%time%',
      countDownTime
    );
    countDownTime--;
  } else {
    fetchBuildStatusAndUpdate().catch(console.error);
    countDownTime = 10;
    sleep(2000);
  }
}

intervalId = setInterval(checkBuildStatus, 1000);
document.getElementById('action-button').style.visibility = 'hidden';
document.getElementById('build-status-message').innerHTML = translations.message.building.replace(
  '%time%',
  countDownTime
);
