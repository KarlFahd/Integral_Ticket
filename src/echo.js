import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

// Null-safe fallback so the app still works when Reverb isn't running
const noop = { listen: () => noop, stopListening: () => noop }
const nullEcho = { channel: () => noop, leave: () => {} }

let echo = nullEcho

try {
  echo = new Echo({
    broadcaster:       'reverb',
    key:               import.meta.env.VITE_REVERB_APP_KEY,
    wsHost:            import.meta.env.VITE_REVERB_HOST  ?? 'localhost',
    wsPort:            import.meta.env.VITE_REVERB_PORT  ?? 8080,
    wssPort:           import.meta.env.VITE_REVERB_PORT  ?? 443,
    forceTLS:          (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats:      true,
  })
} catch (e) {
  console.warn('[Echo] Could not connect to Reverb — real-time disabled.', e)
}

export { echo }
