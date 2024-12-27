import express from 'express'; 
import "./firebase/dbutils.mjs"
import { addItemToCart, getAddresses, getOrders, getProducts, getStores, getStoreWithId, getUserDetail, placeOrder, queryDB, setUserDetail, storeAddresses } from './firebase/dbutils.mjs';
import cors from 'cors'
 
const app = express();
app.use(cors())
app.use(express.json()); 
const port = process.env.PORT || 3000;

app.get('/',(req, res)=>{
    res.send("ok")

})
app.post('/stores',async (req,res)=>{
    let data = await getStores()
    res.send(data)
})

app.post('/stores/:id',async (req,res)=>{
    const {id }= req.params
    let data = await getStoreWithId(id)
    res.send(data)
})

app.post('/products/:id',async (req,res)=>{
    const {id }= req.params
    let data = await getProducts(id)
    res.send(data)
})

app.post('/user/:id',async (req,res)=>{
    const {id }= req.params
    const {name }= req.body
    let data = await getUserDetail(id,name)
    res.send(data)
})

app.post('/userdetails',async (req,res)=>{
    const {id,name }= req.params
      await setUserDetail(id,name)
     res.send("ok")
})


app.post('/addtocart',async (req,res)=>{
    const data = req.body;
    console.log(data)
    addItemToCart(data)
    res.send("ok")
})

app.post('/address/',async (req,res)=>{
    const {id,addresses} = req.body;
    storeAddresses(addresses,id)
    res.send("ok")
})

app.get('/address/:id',async (req,res)=>{
    const data = req.params;
    console.log(data)
    const addresses = await getAddresses(data.id)
    console.log(addresses)
    res.send({addresses})
})

app.get('/search',async (req,res)=>{
    const data =  req.query.query;
    console.log(data)
    let result = await queryDB(data)
   
    res.send(result)
})

app.post('/placeOrder/:id',async (req,res)=>{
    const {id} = req.params;
    const {orderdetails} = req.body;
    await placeOrder(orderdetails,id)
    res.send("ok")
})

app.post('/orders/:id',async (req,res)=>{
    const {id} = req.params;
    
    let data = await getOrders(id)
    console.log(data)
    res.send(data)
})


app.listen(port, ()=>{
    console.log("listening on port " + port);
})