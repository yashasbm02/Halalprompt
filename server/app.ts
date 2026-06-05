import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { streamText, generateText } from 'ai'
import { buildModel, isProviderId } from './providers'

const SYSTEM_PROMPT =
  'You are an expert assistant responding to structured prompt specifications. ' +
  'Read the full spec and deliver a focused, high-quality response that precisely ' +
  'fulfills the stated objective, deliverable format, depth, and tone.'

export const app = new Hono()

app.use('/api/*', secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    // Custom + auth headers are blocked by default — allow the ones BYOK uses.
    allowHeaders: ['Content-Type', 'Authorization', 'x-llm-provider'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

/**
 * Read the client-supplied provider + key from request headers. The key rides
 * in `Authorization: Bearer <key>` (a header, never the JSON body) and is never
 * logged or persisted. Returns empty strings when the caller didn't supply one.
 */
function readCredentials(c: Context) {
  const auth = c.req.header('authorization') ?? ''
  const apiKey = /^bearer /i.test(auth) ? auth.slice(7).trim() : ''
  const providerId = c.req.header('x-llm-provider') ?? ''
  return { apiKey, providerId }
}

app.post('/api/generate', async (c) => {
  const { apiKey, providerId } = readCredentials(c)
  if (!apiKey) return c.json({ error: 'API key required' }, 401)
  if (!isProviderId(providerId)) return c.json({ error: 'Unknown provider' }, 400)

  const { prompt } = await c.req.json<{ prompt?: string }>()
  if (!prompt?.trim()) return c.json({ error: 'prompt is required' }, 400)

  c.header('Cache-Control', 'no-store')

  const result = streamText({
    model: buildModel(providerId, apiKey),
    system: SYSTEM_PROMPT,
    prompt,
    maxTokens: 4096,
  })

  return result.toDataStreamResponse()
})

/**
 * Lightweight key check that powers the "Connected" status in the UI. Makes a
 * 1-token probe and returns only { ok } — it never echoes the key or provider
 * error details (which could contain request metadata).
 */
app.post('/api/validate', async (c) => {
  const { apiKey, providerId } = readCredentials(c)
  if (!apiKey) return c.json({ ok: false, error: 'API key required' }, 401)
  if (!isProviderId(providerId)) {
    return c.json({ ok: false, error: 'Unknown provider' }, 400)
  }

  c.header('Cache-Control', 'no-store')

  try {
    await generateText({
      model: buildModel(providerId, apiKey),
      prompt: 'ping',
      maxTokens: 1,
    })
    return c.json({ ok: true })
  } catch {
    return c.json({ ok: false })
  }
})

app.get('/api/health', (c) => c.json({ ok: true }))
