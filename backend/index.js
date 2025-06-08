const express=require('express');
const app=express();
require('dotenv').config({ path: '../.env' });
const PORT=process.env.PORT||8080;
require('./models/dbConnection'); 
const authRouter=require('./routes/authRouter');
const cors = require('cors');
app.use(cors());
app.use('/auth',authRouter);
app.use(express.json());


app.get("/",(req,res)=>{
    res.send("Hello from Auth Server!");
})
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
