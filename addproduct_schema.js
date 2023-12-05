const { File } = require('buffer');
var mongoo=require('mongoose');


var userSchema= new mongoo.Schema({

pname:{
   type:String,
    reqiured:true
},

pprice:{
    type:String,
    required:true
},
quantity:{
    type:String
},

});

const productModel= mongoo.model('addproduct',userSchema)



module.exports=productModel