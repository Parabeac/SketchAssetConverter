// import wrapVector from './service/vector_service'

// const shapeGroup = require('../assets/vector_test.json')
// wrapVector(shapeGroup)

// import getPagesImages from './service/sketch_service'
// getPagesImages('./assets/inspired_test/inspyred_demo.sketch')

import express from 'express'
import { PORT } from './config/constants'
import { sketchRouter, vectorRouter } from './routes'
const bodyParser = require('body-parser')

const app = express()
app.use(express.json())
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(express.static('dist'))

app.use('/sketch', sketchRouter)
app.use('/vector', vectorRouter)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
