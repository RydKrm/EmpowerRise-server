const client = require('./client');
const express = require('express');
const adminRouter = express.Router();
const { ObjectId } = require('mongodb');
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const category = client.db('empowerRise').collection('category');
    const donation = client.db('empowerRise').collection('donation');
    const fund = client.db('empowerRise').collection('fund');
    const fundApply = client.db('empowerRise').collection('fundApply');
    const notification = client.db('empowerRise').collection('notification');
    const user = client.db('empowerRise').collection('users');

  adminRouter.route('/getAllCategory')
  .get(async(req,res)=>{
    const result = await category.find().toArray();
    res.send(result);
  })

  adminRouter.route('/addCategory')
  .post(async(req,res)=>{
    const data = req.body;
    await category.insertOne(data);
    res.send({status:true});
  })

//ryd - 6-9-23
  adminRouter
  .route('/adminPostRequest')
  .post(async(req,res)=>{
    const data = req.body;
    if(data.type==='donation'){
      const result = await donation.find({status:'pending'}).toArray();
      res.send(result);
    } else if(data.type==='fund'){
      const result = await fund.find({status:'pending'}).toArray();
      res.send(result);
    }
  })

  adminRouter
  .route('/adminStatusUpdate')
  .post(async(req,res)=>{
    const data = req.body;
    const id = new ObjectId(data.id);
    if(data.type==='donation'){
      if(data.status==='accept'){
        await donation.updateOne({_id:id},{$set:{status:'processing'}});
        res.send({status:true});
      } else if(data.status==='reject'){
        await donation.deleteOne({_id:id});
        res.send({status:false});
      }
    } else if(data.type==='fund'){
      if(data.status==='accept'){
        await fund.updateOne({_id:id},{$set:{status:'processing'}});
        res.send({status:true});
      } else if(data.status==='reject'){
        await fund.deleteOne({_id:id});
        res.send({status:false});
      }
    } else if(data.type==='fundApply'){
      const postId = new ObjectId(req.body.id);
      if(data.status==='accept'){
        console.log("check log",postId);
        await fundApply.updateOne({_id:postId},{$set:{status:'accept'}});
        res.send({status:true});
      } else if(data.status==='reject'){
        await fundApply.deleteOne({postId});
        res.send({status:false});
      }
    }


    let userId;
    if(data.type==='fund'){
      userId = await fund.findOne({ _id: id }, { projection: { userId: true,title:true, _id: false }});
    }else if(data.type==='donation'){
      userId = await donation.findOne({ _id: id }, { projection: { userId: true,title:true, _id: false }});
    } else if(data.type==='fundApply'){
      userId = await fundApply.findOne({ _id: id }, { projection: { userId: true,postId:true, _id: false }});
    }

   //notification
   const notifi = {
     isRead:false,
     role:'user',
     postId:data.id,
     userId:userId.userId,
     description:`Your post '${userId.title}' for ${data.type} is ${data.status}ed by admin.`
   }

   if(data.type==='fundApply'){
     const postId = new ObjectId(userId.postId)
     const title = await fund.findOne({_id:postId},{projection:{title:true,_id:false}});
     notifi.description = `Your appication for fund ${title}  is ${data.status}ed by doner.`;
   }
   await notification.insertOne(notifi);
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
