import express from 'express'
import router from './routes/transactions.routes'


const app = express()
app.use(router)
app.use(express.json())


export default app