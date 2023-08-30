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

        const blogsCollection = client.db('empowerRise').collection('blogs')

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
                const query = { email: user.email }
                const existingUser = await usersCollection.findOne(query)
                if (existingUser) {
                    return res.send({ message: 'user already exists' })
                }
                const result = await blogsCollection.insertOne(user);
                res.send(result)
            })

            //ryd - 27-8-23
            userRouter.route('/findUserByEmail')
            .post(async(req,res)=>{
                const email = req.body;
                const result = await usersCollection.find(email).toArray();
              //  console.log(result);
                res.send(result);
            })

            userRouter.route('/addDonationPost')
            .post(async(req,res)=>{
                const data = req.body;
                await donation.insertOne(data);
                res.send({status:true});
            })

            //     let sortPipeLine = [];


              // if (data.sortBy === 'latest') {
              //   let [year, month, day] = $dayLeft.match(/\d+/g);
              //   sortPipeLine.push({
              //     $addFields: {
              //       year :{$toInt:year},
              //       month :{$toInt:month},
              //       day : {$toInt:day}
              //     },
              //   });
              //   sortPipeLine.push({ $sort: { year: 1, month: 1, day: 1 } });
              // } else if (data.sortBy === 'newest') {
              //   let [year, month, day] = $dayLeft.match(/\d+/g);
              //   sortPipeLine.push({
              //     $addFields: {
              //       year :{$toInt:year},
              //       month :{$toInt:month},
              //       day : {$toInt:day}
              //     },
              //   });
              //   sortPipeLine.push({ $sort: { year: -1, month: -1, day: -1}});
              // }

            //ryd 28-8-23
            userRouter.route('/mainData')
            .post(async(req,res)=>{
                const data = req.body;
               console.log("state ",data);
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
                if(data.category){
                    findQuery.push({ category: data.category });
                }
                if(data.status){
                    findQuery.push({ status: data.status });
                }

                let sort = {dayLeft:-1};
                if(data.sortBy==='latest')sort = {dayLeft:-1}
                if(data.sortBy==='newest')sort = {dayLeft:1};
                if(data.sortBy==='lowToHigh') sort = {amount:1};
                if (data.sortBy === "highToLow") sort = {amount:-1};

                if(data.type==='donation'){
                  const totalData = await donation.countDocuments(query);

                  let perPage = 9;
                  const prev = (page-1)*perPage;
                  const now = page*perPage;
                  if(now>totalData) perPage = totalData-prev;

                //  console.log("total data ", totalData);
                  let allData = await donation.find({ $and:findQuery }).sort(sort)
                                           .skip(prev).limit(perPage).toArray();

                  // console.log("filter data ",allData);
                   const data = {totalData:totalData,allData:allData};
                   res.send(data);
                }
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
