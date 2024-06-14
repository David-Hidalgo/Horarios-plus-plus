import mongoose from "mongoose";
import type { iSchedule, iSession, iSection, iSubject, IUser } from "./classes";
import { number } from "zod";

const sessionSchema = new mongoose.Schema<iSession>({
	start: { type: Date, required: true },
	end: { type: Date, required: true },
	day: { type: Number, default: new Date().getDay() },
});

const SessionModel = mongoose.model("Session", sessionSchema);
type TSessionSchema = mongoose.InferSchemaType<typeof sessionSchema>;

const sectionSchema = new mongoose.Schema<iSection>({
	nrc: { type: Number, required: true, unique: true },
	teacher: { type: String, required: true },
	sessions: [
		{ type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
	],
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject",
		required: true,
	},
});

const SectionModel = mongoose.model("Section", sectionSchema);
type TSectionSchema = mongoose.InferSchemaType<typeof sectionSchema>;

const subjectSchema = new mongoose.Schema<iSubject>({
	name: { type: String, required: true },
	sections: { type: [sectionSchema], required: true },
	career: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Career",
		required: true,
	},
});

const SubjectModel = mongoose.model("Subject", subjectSchema);
type TSubjectSchema = mongoose.InferSchemaType<typeof subjectSchema>;

const careerSchema = new mongoose.Schema({
	name: { type: String, required: true },
	subjects: { type: [subjectSchema], required: true },
});

const CareerModel = mongoose.model("Career", careerSchema);
type TCareerSchema = mongoose.InferSchemaType<typeof careerSchema>;


const scheduleSchema = new mongoose.Schema<iSchedule>({
	owner: { type: String, require: true, unique: true },
	sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
});

const ScheduleModel = mongoose.model("Schedule", scheduleSchema);
type TScheduleSchema = mongoose.InferSchemaType<typeof scheduleSchema>;

// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose.Schema<IUser>({
	email: { type: String, required: false },
	password: { type: String, required: true },
	tipo: { type: Number, default: 0 },
	schedule: { type: scheduleSchema, required: false },
});

// 3. Create a Model.
const UserModel = mongoose.model<IUser>("User", userSchema);
type TUserSchema = mongoose.InferSchemaType<typeof userSchema>;

export {
	SessionModel,
	CareerModel,
	SubjectModel,
	SectionModel,
	ScheduleModel,
	UserModel,
};
export type {
	TSessionSchema,
	TCareerSchema,
	TSubjectSchema,
	TSectionSchema,
	TScheduleSchema,
	TUserSchema,
};
