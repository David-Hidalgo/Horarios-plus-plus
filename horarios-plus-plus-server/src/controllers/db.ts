import mongoose from "mongoose";
import type { iSession, iSection, iSubject, iUser, iCareer, Section } from "./../models/classes";
import { Schedule, User } from "./../models/classes";

export class DBController {
	public sectionModel;
	public sessionModel;
	public userModel;
	public subjectModel;
	public careerModel;
	public db: mongoose.Mongoose;
	private constructor(mongoosea: mongoose.Mongoose) {
		this.db = mongoosea;

		const sessionSchema = new mongoose.Schema<iSession>({
			start: { type: Date, required: true },
			end: { type: Date, required: true },
			day: { type: Number, default: new Date().getDay() },
		});

		this.sessionModel = mongoose.model("Session", sessionSchema);
		type TSessionSchema = mongoose.InferSchemaType<typeof sessionSchema>;

		interface iSectionSchema extends iSection {
			sessions: mongoose.Types.ObjectId[];
			subject: mongoose.Types.ObjectId;
		}

		const sectionSchema = new mongoose.Schema<iSectionSchema>({
			nrc: { type: Number, required: true, unique: true },
			teacher: { type: String, required: true },
			sessions: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Session",
					required: true,
				},
			],
			subject: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Subject",
				required: true,
			},
		});

		this.sectionModel = mongoose.model<iSectionSchema>(
			"Section",
			sectionSchema,
		);
		type TSectionSchema = mongoose.InferSchemaType<typeof sectionSchema>;

		interface iSubjectSchema extends iSubject {
			sections: mongoose.Types.ObjectId[];
			career: mongoose.Types.ObjectId;
		}

		const subjectSchema = new mongoose.Schema<iSubjectSchema>({
			name: { type: String, required: true },
			sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
			career: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Career",
				required: true,
			},
		});

		this.subjectModel = mongoose.model("Subject", subjectSchema);
		type TSubjectSchema = mongoose.InferSchemaType<typeof subjectSchema>;

		interface iCareerSchema extends iCareer {
			subjects: mongoose.Types.ObjectId[];
		}

		const careerSchema = new mongoose.Schema<iCareerSchema>({
			name: { type: String, required: true },
			subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
		});

		this.careerModel = mongoose.model("Career", careerSchema);
		type TCareerSchema = mongoose.InferSchemaType<typeof careerSchema>;

		
		type THydratedUserDocument  = mongoose.HydratedDocument<iUser, {schedule:mongoose.Types.DocumentArray<iSectionSchema>}>
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		type UserModelType = mongoose.Model<iUser,{},{},{},THydratedUserDocument >;

		// 2. Create a Schema corresponding to the document interface.
				const userSchema = new mongoose.Schema<iUser,UserModelType>({
			email: { type: String, required: true },
			password: { type: String, required: true },
			tipo: { type: Number, default: 0 },
			schedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
		});

		// 3. Create a Model.
		this.userModel = mongoose.model<iUser, THydratedUserDocument >("User", userSchema);
		type TUserSchema = mongoose.InferSchemaType<typeof userSchema>;


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
	public saveSchedule(user:iUser,sections: Section[]) {
		
		const usuario = new User(user.email, user.password, user.tipo);;
		const amigo = usuario.setSchedules(sections);
		return amigo[0];
	}
}
