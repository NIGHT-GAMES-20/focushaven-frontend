// --- Main token getter with PKCE ---
export async function getValidToken() {
  let token = sessionStorage.getItem("formAuthToken");

  // if no token or expired, do PKCE flow
  if (!token || isTokenExpired(token)) {
    const { verifier, challenge } = await generatePKCE();
    sessionStorage.setItem("pkce_verifier", verifier);

    // step 2: request short-lived auth code
    const code = await requestAuthCode(challenge);

    // step 3: exchange for final JWT
    token = await exchangeCodeForToken(code, verifier);

    // save it in sessionStorage
    sessionStorage.setItem("formAuthToken", token);
    sessionStorage.removeItem("pkce_verifier");
  }

  return token; // always return a valid token here
}

// --- Helper: JWT expiry check ---
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true; // treat bad token as expired
  }
}

// --- Secure fetch wrapper ---
export async function secureFetch(url, options = {}) {
  const token = await getValidToken(); // waits for PKCE+exchange to finish
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// --- Step 1: Generate PKCE pair (verifier + challenge) ---
async function generatePKCE() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { verifier, challenge };
}

// --- Step 2: Ask backend for auth code (send challenge) ---
async function requestAuthCode(code_challenge) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/forum/auth/request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
      },
      body: JSON.stringify({ code_challenge }),
    }
  );

  if (!res.ok) throw new Error("Failed to get auth code");
  const data = await res.json();
  return data.auth_code; // backend returns short-lived code
}

// --- Step 3: Exchange code + verifier for JWT ---
async function exchangeCodeForToken(auth_code, code_verifier) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/forum/auth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
      },
      body: JSON.stringify({ auth_code, code_verifier }),
    }
  );

  if (!res.ok) throw new Error("Token exchange failed");
  const data = await res.json();

  sessionStorage.setItem("formAuthToken", data.token);
  return data.token;
}