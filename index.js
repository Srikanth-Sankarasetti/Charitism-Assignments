const mongoose=require("mongoose")
const express=require("express")
const app=express()
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
app.use(express.json())


// below code represents the mongodb connection
let userRegister
let Todo
const connectingToDatabase=async ()=>{
    try{
        await mongoose.connect("mongodb+srv://srikanth:Srikanth%40143@cluster0.h1y9w8t.mongodb.net/TodoLists")
        const schema=new mongoose.Schema({
            title:{
                type:String,
                required:[true,"please enter the title part of your todo list"],
                trim:true
            },
            description:{
                type:String,
                reuired:[true,"Please enter the description your todo title work"],
                trim:true
            },
            completed:{
                type:Boolean,
                default:false,
            },
            duedate:{
                type:Date,
                default:Date.now
            }
        })

        const userRegisterData=new mongoose.Schema({
            name:{
                type:String,
                required:[true,"please check the username"]
            },
            password:{
                type:String,
                required:[true,"please check the password entry"]
            }
        })

        Todo=mongoose.model("Todo",schema)
        userRegister=mongoose.model("User",userRegisterData)

        // const todo1=new Todo({
        //     title:"Complete coding assignment",
        //     description:"complete the assignment with in dead line",
        //     duedate:new Date("2021-01-05")
        // })

        // todo1.save()
        // .then(result=>{
        //     console.log("saved successfully")
        // })
        // .catch(err=>{
        //     console.log(err)
        // })

      
        app.listen(3000,()=>{
                console.log("app listening at port 3000")
        })
      
        mongoose.connection.on("error",(err)=>{
            console.log(err.message)
            process.exit(1)
        })
        
    } catch(err){
        console.log(err)
        process.exit(1)
    }
}

// connectingToDatabase function to connect to database and app listening after connection
connectingToDatabase()

//middleware function to verify the user with jwtToke
const veryUser=(req,res,next)=>{
    let jwtToken
    const authheader=req.headers["authorization"]
    if(authheader!==undefined){
        jwtToken=authheader.split(" ")[1]
    }
    if(jwtToken==undefined){
        res.status(401)
        res.send("Invalid JwtToken")
    }else{
        jwt.verify(jwtToken,"srikanth",(err,payload)=>{
            if(err){
                res.status(401)
                res.send("Invalid Jwt Token")
            }else{
                req.name=payload.name
                next()
            }
        })
    } 
}


// below code represents the user resgister API 
app.post("/register",async (req,res)=>{
 try{
    const userDetails=req.body
    const {name,password}=userDetails

    //converting string password into hash pasword using bcrypt
    const hasPassword=await bcrypt.hash(password,10)

    //checking user exist's or not, if not exit's new user will add into database
    const checkExistingUser= await userRegister.findOne({name:name})
    console.log(checkExistingUser.name)
    if(checkExistingUser){
        res.status(401)
        res.send("user already exits")
    }else{
        const newUser= new userRegister({
            name:name,
            password:hasPassword
        })
        const userData=await newUser.save()
        res.send(userData)
    }
}
    catch(err){
        console.log(err.message)
    }
})

//API for user login 
app.post("/login",async (req,res)=>{
    const loginDetails=req.body
    const {name,password}=loginDetails

    //checking user exit's or not , if not exits corresponding error will show
    const checkUserExisting=await userRegister.findOne({name})
    if(checkUserExisting){
        //checking string password with available hash password using bcrypt
        const isPaswordMatching=await bcrypt.compare(password,checkUserExisting.password)
        if(isPaswordMatching){
            //providing jwt token to valid user
            const payload={
                "name":checkUserExisting.name
            }
            const jwtToken=await jwt.sign(payload,"srikanth")
            res.send({jwtToken})
        }else{
            res.send("invalid Password")
        }
    }
    else{
        res.status(500)
        res.send("invalid user")
    }
})


//API to get the all tod list 
app.get("/",veryUser,async (req,res)=>{
    const todoLists=await Todo.find()
    res.send(todoLists)
})

//API to add todoList into list
app.post("/addTodoList",veryUser,async (req,res)=>{
 try{
    const tododata=req.body
    const {title,description=""}=tododata
    const checkAvailbleTodo=await Todo.findOne({title})
    if(checkAvailbleTodo===null){
        const todolist= new Todo({
            title,description
        })
        const saveData=await todolist.save()
        res.send(saveData)
    }else{
        res.send("already data availble in todolist")
    }
    } catch(err){
        res.status(500).send(err.message)
        console.log(err.message)
    }
})

//API to delete the todolist by ID
app.delete("/delete/:id",veryUser,async (req,res)=>{
    const {id}=req.params
    try{
    console.log(id)
    const getTodo=await Todo.findById(id)
    if(getTodo!==null){
        const deleted=await Todo.findByIdAndDelete(id)
        res.send("Todo Deleted Sussfully")
    }else{
        res.send("Todo not Found")
    }
    }catch(err){
        res.send(err.message)
    }
})