export function login(username, password) {
  if (username === 'admin' && password === '1234') {
    localStorage.setItem('loggedIn', 'true')
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem('loggedIn')
}

export function isLoggedIn() {
  return localStorage.getItem('loggedIn') === 'true'
}