import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

const app = new Hono()

app.use('/api/*', cors({ origin: 'http://localhost:5173' }))

app.post('/api/generate', async (c) => {
  const { prompt } = await c.req.json<{ prompt: string }>()

  if (!prompt?.trim()) {
    return c.json({ error: 'prompt is required' }, 400)
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system:
      'You are an expert assistant responding to structured prompt specifications. ' +
      'Read the full spec and deliver a focused, high-quality response that precisely ' +
      'fulfills the stated objective, deliverable format, depth, and tone.',
    prompt,
    maxTokens: 4096,
  })

  return result.toDataStreamResponse()
})

app.get('/api/health', (c) => c.json({ ok: true }))

const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`API server → http://localhost:${PORT}`)
})
