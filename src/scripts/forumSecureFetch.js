async function getValidToken() {
  let token = sessionStorage.getItem('formAuthToken');

  if (!token || isTokenExpired(token)) {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/auth/token`, { method: 'POST',headers: { 'Origin': window.location.origin } });
    const data = await res.json();
    sessionStorage.setItem('formAuthToken', data.token);
    return data.token;
  }

  return token;
}

function isTokenExpired(token) {
  if (!token) return true;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return Date.now() >= payload.exp * 1000;
}

export async function secureFetch(url, options = {}) {
  const token = await getValidToken();
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  return fetch(url, options);
}