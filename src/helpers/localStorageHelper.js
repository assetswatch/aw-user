// Add item
function addLocalStorageItem(key, val) {
  localStorage.setItem(key, val);
}

// Get item
function getLocalStorageItem(key) {
  return localStorage.getItem(key);
}

// Remove item
function deleteLocalStorageItem(key) {
  localStorage.removeItem(key);
}

// Clear all
function clearLocalStorage() {
  localStorage.clear();
}

// Get keys length
function getLocalStorageKeysLength() {
  return localStorage.length;
}

// Get key name
function getLocalStorageKeyName(index) {
  return localStorage.key(0);
}

export {
  addLocalStorageItem,
  getLocalStorageItem,
  deleteLocalStorageItem,
  clearLocalStorage,
  getLocalStorageKeysLength,
  getLocalStorageKeyName,
};
