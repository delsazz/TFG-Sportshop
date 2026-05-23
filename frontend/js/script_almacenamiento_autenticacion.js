function setAuthValue(key, value) {
  sessionStorage.setItem(key, value);
}

function getAuthValue(key) {
  return sessionStorage.getItem(key);
}

function clearAuthStorage() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userRoles');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userEmail');
}

function getToken() {
  return getAuthValue('token');
}
