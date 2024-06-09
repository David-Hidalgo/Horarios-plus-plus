import { Elysia } from "elysia";
import mongoose, { type ConnectOptions } from 'mongoose';

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

const uri = "mongodb+srv://humberto:cocosete@serverdata.64ryvhh.mongodb.net/?retryWrites=true&w=majority&appName=serverdata";
const clientOptions: ConnectOptions = { };

async function run() {
  await mongoose.connect(uri, clientOptions);
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

run().catch(console.dir);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
