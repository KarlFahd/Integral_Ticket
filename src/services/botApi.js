import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

export const botApi = {
  async chat({ messages, username, isAdmin, isHr }) {
    const { data } = await http.post('/bot/chat', {
      messages,
      username,
      is_admin: isAdmin,
      is_hr: isHr,
    })
    return data // { reply, actions }
  },
}
