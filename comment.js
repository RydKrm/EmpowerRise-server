const client = require('./client');
const express = require('express');
const commentRouter = express.Router();
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
    const comment = client.db('empowerRise').collection('comment');
    const reply = client.db('empowerRise').collection('reply');

    //ryd - 8-9-23
    commentRouter.route('/addComment')
    .post(async(req,res)=>{
      const data = req.body ;
      await comment.insertOne(data);
      res.send({status:true});
    })

    commentRouter.route('/getCommentList')
    .post(async(req,res)=>{
      const postId = req.body.postId;
      const result = await comment.find({postId}).toArray();
      res.send(result);
    })

    commentRouter.route('/addReply')
    .post(async(req,res)=>{
      const data = req.body;
      await reply.insertOne(data);
      res.send({status:true});
    })

    commentRouter.route('/getReplyList')
    .post(async(req,res)=>{
      const commentId = req.body.commentId;
      const result = await reply.find({commentId}).toArray();
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment from comment.");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
 }
 run().catch(console.dir);
 module.exports = commentRouter;
