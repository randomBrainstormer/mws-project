/**
 * Activate service worker if available
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service_worker.js');
  });
}