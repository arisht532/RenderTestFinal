const mongoose=require('mongoose')
const Database=process.env.DATABASE

mongoose.connect(Database,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>console.log('connection successful')
)
.catch((err)=>{
    console.log(err)
})