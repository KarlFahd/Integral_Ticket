import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

export const authApi = {
  async login(username, password) {
    const { data } = await http.post('/login', { username, password })
    // Returns { user } for normal login, or { requires_2fa: true, username } for 2FA login
    return data
  },

  async verify2fa(username, code) {
    const { data } = await http.post('/2fa/verify', { username, code })
    return data.user
  },

  // Step 1: get a QR code (secret is NOT saved yet)
  async setup2fa(username) {
    const { data } = await http.post('/2fa/setup', { username })
    return data // { secret, qr_url }
  },

  // Step 2: confirm the scan worked — secret is saved only here
  async enable2fa(username, secret, code) {
    const { data } = await http.post('/2fa/enable', { username, secret, code })
    return data
  },

  async disable2fa(username) {
    const { data } = await http.post('/2fa/disable', { username })
    return data
  },

  async get2faStatus(username) {
    const { data } = await http.post('/2fa/status', { username })
    return data.enabled // boolean
  },
}
