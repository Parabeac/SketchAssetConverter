// import wrapVector from './service/vector_service'

// const shapeGroup = require('../assets/vector_test.json')
// wrapVector(shapeGroup)

import express from 'express'
import { PORT } from './config/constants'
import { sketchRouter } from './routes'

const app = express()
app.use(express.json())

app.use('/sketch', sketchRouter)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
