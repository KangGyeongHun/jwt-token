const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')

//config연결
const config = require('./config')
const port = process.env.PORT || 3000 

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(morgan('dev'))

//시크릿코드 설정
app.set('jwt-secret', config.secret)

//테스트용 인덱스 페이지
app.get('/', (req, res) => {
    res.send('Hello JWT')
})

app.use('/api', require('./routes/api'))

//서버 오픈
app.listen(port, () => {
    console.log(`Express is running on port ${port}`)
})

//몽고DB서버 연결
mongoose.connect(config.mongodbUri)
const db = mongoose.connection
db.on('error', console.error)
db.once('open', ()=>{
    console.log('connected to mongodb server')
})