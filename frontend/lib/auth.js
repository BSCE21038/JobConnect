export function saveUser(u) {
  localStorage.setItem("jc_user", JSON.stringify(u));
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("jc_user") || "null");
  } catch {
    return null;
  }
}
export function logout() {
  localStorage.removeItem("jc_user");
  localStorage.removeItem("jc_access");
  localStorage.removeItem("jc_refresh"); // <-- add this

  // optional: window.location.href = "/login";
}
