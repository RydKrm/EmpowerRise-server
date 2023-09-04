const client = require('./client');
const express = require('express');
const adminRouter = express.Router();

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const category = client.db('empowerRise').collection('category');
    
  adminRouter.route('/getAllCategory')
  .get(async(req,res)=>{
    const result = await category.find().toArray();
    res.send(result);
  })

  adminRouter.route('/addCategory')
  .post(async(req,res)=>{
    const data = req.body;
   // console.log(data);
    await category.insertOne(data);
    res.send({status:true});
  })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
module.exports = adminRouter;
