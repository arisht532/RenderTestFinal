const express=require('express')
const dotenv=require('dotenv');
const session=require('express-session')



dotenv.config({path:'./config.env'});
const app=express()
app.use(express.static('upload'))
app.use(express.static('views'))
app.use(express.static('public'))
const router=express.Router()

app.set('view engine','ejs')
const multer=require('multer')
const bodyParser=require('body-parser')
app.use(bodyParser.urlencoded({extended:true}))

const bcrypt=require('bcryptjs')


// DATABASE 
require('./mongoconnection')

// signup schema
const USERDATA=require('./singup_schema')

//add product schema
const Addpro=require('./addproduct_schema')



app.use(
    session({
        secret:'iamdevagooddev',
        resave:false,
        saveUninitialized:false,
        cookie:{
              maxAge:2000000000
        }
    })
)










router.get('/',(req,res)=>{
 res.render('index')
})



router.get('/login',(req,res)=>{
    res.render('login')
})


router.post('/login',async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    try{
        const user=await USERDATA.findOne({email:email})
        .exec()
        console.log(user)
        
        if(user){
           const matchpass=await bcrypt.compare(password,user.password)
           if(!matchpass){
            res.redirect('/login')
           }else{

            console.log('login successful')
       
        }
        }
       req.session.user=user
       res.redirect('/admin')


    }catch(err){
        throw err
    }
})

router.get('/signup',(req,res)=>{
    res.render('signup')
})

router.post('/signup',async(req,res)=>{
    const{email,password}=req.body;

 const user=await new USERDATA({email,password})
 user.save()
 if(user){
    console.log('data send successfull')
    res.redirect('/login')
 }
 else{
console.log(err)
 }

})







router.get('/admin',(req,res)=>{
    if(req.session.user){
    res.render('dashboard/index2')
    }else{
        res.redirect('/login')
    }

})



router.get('/addproduct',(req,res)=>{
    if(req.session.user){
    res.render('dashboard/addproduct')
    }else{
        res.send('<script>alert("Please login first");window.open("/login","_self")</script>')
    }
})



const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'../SIRPROJECT/upload')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
const fileFilter=(req,file,cb)=>{
    const allowedfileType=['image/jpeg','image/jpg','image/png']
    if(allowedfileType.includes(file.mimetype)){
        cb(null,true)
    }else{
        cb(null,false)
    }
}



const upload=multer({storage,fileFilter})

    

router.post('/addproduct',upload.single('pfile'),async(req,res)=>{
 try{
        const pfile=req.file.filename;
        const{pname,pprice,quantity}=req.body;

        const user=new Addpro({pname,pprice,quantity})
        const savedata=await user.save()
        if(savedata){
            res.send('<script>alert("Product Add successfully");window.open("/admin", "_self");</script>')

        }else{
            res.redirect('/')
        }

    }catch(err){
        console.log(err)
    }
})




router.get('/viewdata',async(req,res)=>{
 try{
    if(req.session.user){
    const data=await Addpro.find();
    res.render('dashboard/viewdata',{data:data})
    }else{
        res.send('<script>alert("please login first");window.open("/login","_self")</script>')
    }
 }catch(err){console.log(err)}
})



router.get('/edit/:id',async(req,res)=>{
    try{
 
    const data=await Addpro.findById(req.params.id);
 
    console.log(data);
    res.render('dashboard/addpro_edit',{data:data})
    }
    catch(err){
     console.log(err)
    //  res.render('dashboard/addpro_edit')
    }
    
 });


 router.post('/edit/:id',upload.single('pfile'),async(req,res)=>{
    try{
        const updateViewdata={
            pfile:req.body.pfile,
            pname:req.body.pname,
            pdiscount:req.body.pdiscount,
            pprice:req.body.pprice,
            category:req.body.category,
           quantity:req.body.quantity
           
        };
        if (req.file) {
          
            updateViewdata.pfile = req.file.filename;
      
       
          }
        const data= await Addpro.findByIdAndUpdate(req.params.id, updateViewdata)
        console.log(data)
      
        res.redirect('/viewdata')
    }
    catch(err){
     console.log(err)
    
    }
        })


    router.get('/delete/:id',async(req,res)=>{
        try{
            const user=await Addpro.findByIdAndRemove(req.params.id)
            console.log('deleted data'+user)
            if(user){
                res.redirect('/viewdata')
            }
        }catch(err){
            console.log(err)
        }

    })


































router.get('/viewcategory',(req,res)=>{
    if(req.session.user){
    res.render('dashboard/view_category')}
    // else {
    //     const alertMessage = "Please login first";
    //     const redirectUrl = "/login";
    //     const htmlResponse = `
    //         <script>
    //             alert('${alertMessage}');
    //             window.location.href = '${redirectUrl}';
    //         </script>
    //     `;
    //     res.send(htmlResponse);}




    else{
 res.send('<script>alert("Please login first");window.open("/login", "_self");</script>')

    }
})



router.get('/honda',async(req,res)=>{
   try{
    const user=await Addpro.find({category:'honda'})
    if(user){
        res.render('dashboard/honda',{data:user})
    }
   }catch(err){
console.log(err)
   }
})

router.get('/maruti',async(req,res)=>{
    try{
        const user=await Addpro.find({category:'maruti'})
        if(user){
            res.render('dashboard/maruti',{data:user})
        }
    }catch(err){
        console.log(err)
    }
})
router.get('/skoda',async(req,res)=>{
    try{
        const user=await Addpro.find({category:'skoda'})
        if(user){
            res.render('dashboard/skoda',{data:user})
        }
    }catch(err){
        console.log(err)
    }
})




router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.clearCookie('connect.sid');
        res.send('<script>alert("You logout successfull");window.open("/login", "_self");</script>');
    });
});













const PORT=process.env.PORT

app.use('/',router)
app.listen(PORT)