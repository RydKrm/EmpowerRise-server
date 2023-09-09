const { ObjectId } = require('mongodb');
const client = require('./client');
const express = require('express');
const userRouter = express.Router();
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const usersCollection = client.db('empowerRise').collection('users');
        const donation = client.db('empowerRise').collection('donation');
        const fund = client.db('empowerRise').collection('fund');
        const fundApply = client.db('empowerRise').collection('fundApply');
        const donationPayment = client.db('empowerRise').collection('donationPayment');
        const blogsCollection = client.db('empowerRise').collection('blogs');
        const notification = client.db('empowerRise').collection('notification');

        userRouter.route('/users')
            .post(async (req, res) => {
                const user = req.body;
                const query = { email: user.email }
                const existingUser = await usersCollection.findOne(query)
                if (existingUser) {
                    return res.send({ message: 'user already exists' })
                }
                const result = await usersCollection.insertOne(user);
                res.send(result)
            })
        userRouter.route('/blogs')
            .post(async (req, res) => {
                const user = req.body;
                const result = await blogsCollection.insertOne(user);
                res.send(result)
            })

        //ryd - 27-8-23
        userRouter.route('/findUserByEmail')
            .post(async (req, res) => {
                const email = req.body;
                const result = await usersCollection.find(email).toArray();
                //  console.log(result);
                res.send(result);
            })

        userRouter.route('/addDonationPost')
            .post(async (req, res) => {
                const data = req.body;
                await donation.insertOne(data);
                res.send({ status: true });
            })

        userRouter.route('/addFundPost')
            .post(async (req, res) => {
                const data = req.body;
                await fund.insertOne(data);
                res.send({ status: true });
            })

        //ryd 28-8-23
        userRouter.route('/mainData')
            .post(async (req, res) => {
                const data = req.body;
                console.log("state ", data);
                const page = data.page;
                const sortBy = data.sortBy;
                let query = {};
                if (data.category) {
                    query.category = data.category;
                }
                if (data.status) {
                    query.status = data.status;
                }
                let findQuery = [{}];
                if (data.category) {
                    findQuery.push({ category: data.category });
                }
                if (data.status) {
                    findQuery.push({ status: data.status });
                }

                let sort = { dayLeft: 1 };
                if (data.sortBy === 'latest') sort = { dayLeft: -1 }
                if (data.sortBy === 'oldest') sort = { dayLeft: 1 };
                if (data.sortBy === 'lowToHigh') sort = { amount: 1 };
                if (data.sortBy === "highToLow") sort = { amount: -1 };

                if (data.type === 'donation') {
                    const totalData = await donation.countDocuments(query);
                    let perPage = 9;
                    const prev = (page - 1) * perPage;
                    const now = page * perPage;
                    if (now > totalData) perPage = totalData - prev;
                    let allData = await donation.find({ $and: findQuery }).sort(sort)
                        .skip(prev).limit(perPage).toArray();
                    const data = { totalData: totalData, allData: allData };
                    res.send(data);
                } else if (data.type === 'fund') {
                    const totalData = await fund.countDocuments(query);
                    console.log("total fund data ", totalData);
                    let perPage = 9;
                    const prev = (page - 1) * perPage;
                    const now = page * perPage;
                    if (now > totalData) perPage = totalData - prev;
                    let allData = await fund.find({ $and: findQuery }).sort(sort)
                        .skip(prev).limit(perPage).toArray();
                    const data = { totalData: totalData, allData: allData };
                    res.send(data);
                }
            })

        //ryd 30-8-23

        userRouter
            .route('/getSingleDonation')
            .post(async (req, res) => {
                const id = new ObjectId(req.body);
                const post = await donation.find({ _id: id }).toArray();
                const userId = new ObjectId(post[0].userId);
                const user = await usersCollection.find({ _id: userId }).toArray();
                const result = {
                    post: post,
                    user: user
                }
                res.send(result);
            })


            userRouter
            .route('/getSingleFund')
            .post(async (req, res) => {
                const id = new ObjectId(req.body);
                const post = await fund.find({ _id: id }).toArray();
                const userId = new ObjectId(post[0].userId);
                const user = await usersCollection.find({ _id: userId }).toArray();
                const result = {
                    post: post,
                    user: user
                }
                res.send(result);
            })

        userRouter
            .route('/getUserById')
            .post(async (req, res) => {
                const id = new ObjectId(req.body.id);
                const result = await usersCollection.find({ _id: id }).toArray();
                res.send(result);
            })

        userRouter
            .route('/donationPayment')
            .post(async (req, res) => {
                const data = req.body;
                // console.log("donationPayment ", data);
                const postId = new ObjectId(data.postId);
                const preData = await donation.find({ _id: postId }).toArray();
                const donatedPeople = preData[0].donatedPeople + 1;
                const collectedAmount = parseInt(preData[0].collectedAmount) + parseInt(data.donatedAmount);
                await donation.updateOne({ _id: postId }, { $set: { collectedAmount: collectedAmount, donatedPeople: donatedPeople } });
                await donationPayment.insertOne(data);
                res.send({ status: true });

               //notoficatoin
                 let postName = await donation.findOne({_id:postId},{projection:{title:true,userId:true,_id:false}});
                 const title = postName.title;

                 const notif = {
                   isRead:false,
                   role:'user',
                   userId:postName.userId,
                   postId,
                   description:`${data.userName} is donated ${data.donatedAmount} in your '${title}' post`
                 }
                 await notification.insertOne(notif);
            })

        userRouter
            .route('/applyFund')
            .post(async (req, res) => {
                const data = req.body;
                await fundApply.insertOne(data);
                res.send({ status: true });

                // notification
            const postId = new ObjectId(data.postId);
             let postName = await fund.findOne({_id:postId},{projection:{title:true,userId:true,_id:false}});
             const title = postName.title;

             const notif = {
               isRead:false,
               role:'user',
               userId:postName.userId,
               postId,
               description:`${data.name} is applied for fund in your '${title}' post`
             }
             await notification.insertOne(notif);

            })

        userRouter
            .route('/findDonatedPeople')
            .post(async (req, res) => {
                const postId = req.body.postId;
                //  console.log("post ",req.body);
                const result = await donationPayment.find({ postId: postId }).toArray();
                res.send(result);
            })


        userRouter.route('/blogs')
            .get(async (req, res) => {
                const result = await blogsCollection.find().toArray()
                res.send(result)
            })


        userRouter.route('/blogs/:id')
            .get(async (req, res) => {
                const blogId = req.params.id;
                const result = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
                res.send(result)
            });

       //ryd 6-9-23
       userRouter
       .route('/getDonationList')
       .post(async(req,res)=>{
        const userId = req.body.userId;
         const result = await donation.find({userId:userId}).toArray();
         res.send(result);
       })

       userRouter
       .route('/getfundList')
       .post(async(req,res)=>{
        const userId = req.body.userId;
         const result = await fund.find({userId:userId}).toArray();
         res.send(result);
       })

       userRouter
       .route('/fundAllApply')
       .post(async(req,res)=>{
         const postId = req.body.postId;
         const result = await fundApply.find({$and:[{postId},{status:'pending'}]}).toArray();
         res.send(result);
       })

       userRouter
       .route('/findUserName')
       .post(async(req,res)=>{
         const id = new ObjectId(req.body.id);
         const result = await usersCollection.findOne({_id:id},{projection:{name:true,_id:false}});
         res.send(result);
       })

       userRouter
       .route('/fundStatusUpdate')
       .post(async(req,res)=>{
         const id = req.body.id;
         const status = req.body.status;
       })
   //notification
   userRouter
   .route('/getUserNotification')
   .post(async(req,res)=>{
     const userId = req.body.userId;
     const result = await notification.find({userId}).toArray();
     res.send(result);
   })

   userRouter.route('/updateNotification')
   .post(async(req,res)=>{
     const id = new ObjectId(req.body.id);
     await notification.updateOne({_id:id},{$set:{isRead:true}});
     res.send({status:true})
   })

   userRouter.route('/deleteNotification')
   .post(async(req,res)=>{
     const id = new ObjectId(req.body.id);
     await notification.deleteOne({_id:id});
     res.send({status:true});
   })

   userRouter.route('/countNotofication')
   .post(async(req,res)=>{
     const userId = req.body.userId;
     const total = await notification.countDocuments({ userId: userId });
     res.send({total});
   })

   userRouter.route('/getUserInfo')
   .post(async(req,res)=>{
     const userId = req.body.userId;
     const fundPost = await fund.countDocuments({userId:userId});
     const donationPost = await donation.countDocuments({userId:userId});
     const userInfo = {fundPost,donationPost};
     res.send(userInfo);
   })

   userRouter.route('/getCampainDonation')
   .get(async(req,res)=>{
     const data = await donation.find({}).limit(5).toArray();
     res.send(data);
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
module.exports = userRouter;
