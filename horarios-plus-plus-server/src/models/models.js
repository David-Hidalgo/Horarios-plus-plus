import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true, unique: false }
})

const ScheduleSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  owner: { type: String, require: true, unique: true },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
})

const CareerSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, require: true, unique: true },
  Subject: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }]
})

const SubjectSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, require: true, unique: true },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  careers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Career" }],
})

const SectionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  nrc: { type: String, require: true, unique: true },
  teacher: { type: String, require: true, unique: false },
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" }
})

const SessionSchema = new mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  day: { type: Number, required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }
})

const Session = mongoose.model("Session", SessionSchema)
const Section = mongoose.model("Section", SectionSchema)
const Subject = mongoose.model("Subject", SubjectSchema)
const Career = mongoose.model("Career", CareerSchema)
const Schedule = mongoose.model("Schedule", ScheduleSchema)
const User = mongoose.model("User", UserSchema)

export { Session, Section, Subject, Career, Schedule, User }