const mongo=require('mongoose')
const bcrypt=require('bcryptjs')
const userSchema=new mongo.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
    this.password=await bcrypt.hash(this.password,12)
    }
    next()
})






const userModel=mongo.model('singup',userSchema)
module.exports=userModel