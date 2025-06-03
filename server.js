import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import initializeDatabase from './config/db.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import projectRoutes from './routes/project.routes.js'
import assignmentRoutes from './routes/assignment.routes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

initializeDatabase()

app.use('/api/auth', authRoutes)
app.use('/api/engineers', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/assignments', assignmentRoutes)
app.get('/', (req,res) => {
    res.send("hi DEV")
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is running on PORT: ${PORT}`)
})

