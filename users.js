const client = require('./client');
const express = require('express');
const userRouter = express.Router();

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const usersCollection = client.db('empowerRise').collection('users');
        const donation = client.db('empowerRise').collection('donation');
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
