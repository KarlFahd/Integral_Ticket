import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

export const usersApi = {
  async getAll() {
    const { data } = await http.get('/users')
    return data.data
  },

  async create(payload) {
    const { data } = await http.post('/users', payload)
    return data.data
  },
}
