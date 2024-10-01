function addSessionStorageItem(key, val) {
  sessionStorage.setItem(key, val);
}

// Get item
function getsessionStorageItem(key) {
  return sessionStorage.getItem(key);
}

// Remove item
function deletesessionStorageItem(key) {
  sessionStorage.removeItem(key);
}

// Clear all
function clearsessionStorage() {
  sessionStorage.clear();
}

// Get keys length
function getsessionStorageKeysLength() {
  return sessionStorage.length;
}

// Get key name
function getsessionStorageKeyName(index) {
  return sessionStorage.key(0);
}

export {
  addSessionStorageItem,
  getsessionStorageItem,
  deletesessionStorageItem,
  clearsessionStorage,
  getsessionStorageKeysLength,
  getsessionStorageKeyName,
};
