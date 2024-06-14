// import {
// 	ScheduleModel,
// 	SectionModel,
// 	SessionModel,
// 	UserModel,
// 	SubjectModel,
// } from "./../models/schemas";
// import type {
// 	iSection,
// 	iSchedule,
// 	iSession,
// 	iSubject,
// } from "./../models/classes";
import {
	type iSchedule,
	type iSession,
	type iSection,
	type iSubject,
	type IUser,
	Schedule,
	User,
} from "./../models/classes";

import type { Mongoose } from "mongoose";

export class DBController {
	public SectionModel;
	public SessionModel;
	public UserModel;
	public SubjectModel;
	public ScheduleModel;
	public db: Mongoose;
	private constructor(mongoosea: Mongoose) {
		this.db = mongoosea;
		const sessionSchema = new this.db.Schema<iSession>({
			start: { type: Date, required: true },
			end: { type: Date, required: true },
			day: { type: Number, default: new Date().getDay() },
		});

		const SessionModel = this.db.model("Session", sessionSchema);
		// type TSessionSchema = this.db.InferSchemaType<typeof sessionSchema>;

		const sectionSchema = new this.db.Schema<iSection>({
			nrc: { type: Number, required: true, unique: true },
			teacher: { type: String, required: true },
			sessions: { type: [sessionSchema], required: true },
			subject: {
				type: this.db.Schema.Types.ObjectId,
				ref: "Subject",
				required: true,
			},
		});

		const SectionModel = this.db.model("Section", sectionSchema);
		// type TSectionSchema = this.db.InferSchemaType<typeof sectionSchema>;

		const subjectSchema = new this.db.Schema<iSubject>({
			name: { type: String, required: true },
			sections: { type: [sectionSchema], required: true },
			career: {
				type: this.db.Schema.Types.ObjectId,
				ref: "Career",
				required: true,
			},
		});

		const SubjectModel = this.db.model("Subject", subjectSchema);
		// type TSubjectSchema = this.db.InferSchemaType<typeof subjectSchema>;

		const careerSchema = new this.db.Schema({
			name: { type: String, required: true },
			subjects: { type: [subjectSchema], required: true },
		});

		const CareerModel = this.db.model("Career", careerSchema);
		// type TCareerSchema = this.db.InferSchemaType<typeof careerSchema>;

		const scheduleSchema = new this.db.Schema<iSchedule>({
			sections: { type: [sectionSchema], required: true },
		});

		const ScheduleModel = this.db.model("Schedule", scheduleSchema);
		// type TScheduleSchema = this.db.InferSchemaType<typeof scheduleSchema>;

		// 2. Create a Schema corresponding to the document interface.
		const userSchema = new this.db.Schema<IUser>({
			email: { type: String, required: false },
			password: { type: String, required: true },
			tipo: { type: Number, default: 0 },
			schedule: { type: scheduleSchema, required: false },
		});

		// 3. Create a Model.
		const UserModel = this.db.model<IUser>("User", userSchema);
		// type TUserSchema = this.db.InferSchemaType<typeof userSchema>;
		this.SectionModel = SectionModel;
		this.SessionModel = SessionModel;
		this.UserModel = UserModel;
		this.SubjectModel = SubjectModel;
		this.ScheduleModel = ScheduleModel;
	}
	public static async run(uri: string) {
		// 4. Connect to MongoDB
		const db = await require("mongoose");
		
		db.connect(uri);
		await db.connection.db.admin().command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!",
		);

		return new DBController(db);
	}

	public static async disconnect() {
		const db = await require("mongoose");
		db.disconnect();
	} 
	public createSchedule(sections: iSection[]): iSchedule {
		const user = new this.UserModel({
			name: "Bill",
			email: "bill@initech.com",
			avatar: "https://i.imgur.com/dM7Thhn.png",
		});
		const amigo = User.getSchedules(user.email, sections);
		return amigo[0];
	}
}
