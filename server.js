const express = require('express')
const morgan = require('morgan')
const app = express()
const {readdirSync} = require('fs')
const cors = require('cors');
// const authRouter = require('./routes/auth');
// const categoryRouter  = require('./routes/category')

//middleware
app.use(morgan('dev'))
app.use(express.json({limit:'20mb'}))
app.use(cors())

// app.use('/api',authRouter)
// app.use('/api',categoryRouter)

readdirSync('./routes').map((c)=> app.use('/api',require('./routes/'+c )))

//Router
// app.post('/api',(req,res)=>{
//     const {username,password} = req.body
//     console.log(username,[password])
//     res.send('Jukkkk')
    
// })

// Start Server
app.listen(3000,()=> console.log('Server is running on port 3000')
)