import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

export const botApi = {
  /**
   * POST /api/bot/chat
   *
   * Sends the full conversation history + the current user's identity to the
   * backend. The full history is needed so Gemini can understand references to
   * earlier messages ("resolve that ticket" needs to know which ticket was just
   * discussed). Identity (username, isAdmin, isHr) is needed so BotService can
   * scope tool results — employees see only their own tickets, admin sees all.
   *
   * Returns: { reply: string, actions: [{type, ...}] }
   *   reply   — the bot's text response to show in the chat bubble
   *   actions — side-channel instructions for the frontend (navigate, theme)
   *             collected from MCP tool calls during the agentic loop
   *
   * Note: isAdmin/isHr are camelCase in JS but the backend expects snake_case.
   */
  async chat({ messages, username, isAdmin, isHr }) {
    const { data } = await http.post('/bot/chat', {
      messages,
      username,
      is_admin: isAdmin,
      is_hr:    isHr,
    })
    return data
  },
}
