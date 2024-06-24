import express from 'express';
import cors from "cors"


const app = express()
const port = 4000

import mongoose from 'mongoose';
const uri = "mongodb+srv://humberto:cocosete@serverdata.64ryvhh.mongodb.net/?retryWrites=true&w=majority&appName=serverdata";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  await mongoose.connect(uri, clientOptions);
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

run().catch(console.dir);

const corsOptions = { origin : "*",  }
app.use(cors(corsOptions)) 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

import { subjectRoutes } from './src/routes/subjects.routes.js';
import { sectionRoutes } from './src/routes/sections.routes.js';
import { sessionRoutes } from './src/routes/sessions.routes.js';
import { schedulesRoutes } from './src/routes/schedules.routes.js';
import { userRoutes } from './src/routes/user.routes.js';
subjectRoutes(app)
sectionRoutes(app)
sessionRoutes(app)
schedulesRoutes(app)
userRoutes(app)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


