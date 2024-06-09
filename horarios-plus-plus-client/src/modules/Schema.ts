import * as mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
/*   _id : mongoose.Schema.Types.ObjectId, */
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  day: { type: Number, required: true },
});

export type TSession = mongoose.InferSchemaType<typeof SessionSchema>;
export const SessionModel = mongoose.model("session", SessionSchema);
export interface ISession extends TSession {}

const SectionSchema = new mongoose.Schema({
/*   _id : mongoose.Schema.Types.ObjectId,
 */  nrc: { type: String, required: true },
  hours: [SessionSchema],
});

export type TSection = mongoose.InferSchemaType<typeof SectionSchema>;
export interface ISection extends TSection{}
export const SectionModel = mongoose.model("section", SectionSchema);

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sections: [SectionSchema],
  pensum: [String],
});

export type TSubject = mongoose.InferSchemaType<typeof SubjectSchema>;
export interface ISubject extends TSubject {}
export const SubjectModel = mongoose.model("subject", SubjectSchema);

const ScheduleSchema = new mongoose.Schema({
  correo: { type: 'string', required: false },
  subjects: { type: [SubjectSchema], required: true }
});

export type TSchedule = mongoose.InferSchemaType<typeof ScheduleSchema>;
export interface ISchedule extends TSchedule {}

export const ScheduleModel = mongoose.model("schedule", ScheduleSchema);
/* 
export type Animalote = mongoose.InferSchemaType<typeof animalSchema>;
export const animal = mongoose.model("Animal", animalSchema); */