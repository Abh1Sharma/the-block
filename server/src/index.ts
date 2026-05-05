import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import vehiclesRoute from './routes/vehicles.js'
import bidsRoute from './routes/bids.js'
import { runCompetingBidSimulation } from './store/vehicleStore.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))

app.route('/api/vehicles', vehiclesRoute)
app.route('/api/vehicles', bidsRoute)

app.get('/api/health', (c) => c.json({ ok: true }))

runCompetingBidSimulation()

serve({ fetch: app.fetch, port: 3001 }, () => {
  console.log('Server → http://localhost:3001')
})
