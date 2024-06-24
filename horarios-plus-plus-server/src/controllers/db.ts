import mongoose, { mongo } from "mongoose";
import type {
	iSession,
	iSection,
	iSubject,
	iUser,
	iCareer,
	Section,
} from "./../models/classes";
import { Schedule, User } from "./../models/classes";

interface iSubjectSchema extends iSubject {
			sections: mongoose.Types.ObjectId[];
			career: mongoose.Types.ObjectId;
		}
export class DBController {
	public db: mongoose.Mongoose;
	public sessionModel;
	public sectionModel;
	public subjectModel;
	public careerModel;
	public userModel;
	private constructor(mongoosea: mongoose.Mongoose) {
		this.db = mongoosea;

		const sessionSchema = new mongoose.Schema<iSession>({
			start: { type: Date, required: true },
			end: { type: Date, required: true },
			day: { type: Number, default: new Date().getDay() },
		});

		this.sessionModel = mongoose.model("Session", sessionSchema);
		type TSessionSchema = mongoose.InferSchemaType<typeof sessionSchema>;

		type SectionHydratedDocument = mongoose.HydratedDocument< iSection,{ 
			sessions: mongoose.Types.DocumentArray<iSession> }>;

		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		type SectionModelType = mongoose.Model<iSection, {}, {}, {}, SectionHydratedDocument>;

		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		const sectionSchema = new mongoose.Schema<iSection,SectionModelType,{},{},{},{},iSection>({
			nrc: { type: Number, required: true, unique: true },
			teacher: { type: String, required: true },
			sessions: [
				sessionSchema
			],
		});

		this.sectionModel = mongoose.model<iSection,SectionModelType>(
			"Section",
			sectionSchema,
		);
		type TSectionSchema = mongoose.InferSchemaType<typeof sectionSchema>;

		

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

		type THydratedUserDocument = mongoose.HydratedDocument<
			iUser,
			{
				schedule: mongoose.Types.DocumentArray<iSection>;
			}
		>;
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		type UserModelType = mongoose.Model<iUser,{},{},{},THydratedUserDocument>;

		const userSchema = new mongoose.Schema<iUser, UserModelType>({
			email: { type: String, required: true },
			password: { type: String, required: true },
			tipo: { type: Number, default: 0 },
			schedule: [sectionSchema],
		});

		this.userModel = mongoose.model<iUser, UserModelType>(
			"User",
			userSchema,
		);
		type TUserSchema = mongoose.InferSchemaType<typeof userSchema>;
	}
	public static async run(uri: string) {
		// 4. Connect to MongoDB
		await mongoose.connect(uri);
		await mongoose.connection.db.admin().command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!",
		);
		mongoose.connection.on("error", console.error.bind(console, "connection error:"));
		const db = await require("mongoose");
		return new DBController(new db.Mongoose());
	}

	public static async disconnect() {
		const db = await require("mongoose");
		db.disconnect();
	}
	//MARK: secciones
	public async addSessionToSection(nrc: string, session: iSession) {
		const result=await this.sectionModel.findOne({ 'nrc': nrc }, 'sections');
		if (!result) {
			throw new Error("Section not found");
		}
		const sessionDoc = new this.sectionModel(session);
		result.sessions.push(sessionDoc);
		await result.save();		
	}
	public async deleteSessionFromSection(nrc: string, session: iSession) {
		const result=await this.sectionModel.findOne({ 'nrc': nrc }, 'sections');
		if (!result) {
			throw new Error("Section not found");
		}
		const sessionDoc=result.sessions.filter((s) => s.start === session.start && s.end === session.end && s.day === session.day);
		sessionDoc[0].deleteOne();
		await result.save();		
	}
	public saveSection(section: iSection) {
		const seccion = new this.sectionModel(section);
		return seccion.save();
	}
	public async getSections() {
		return this.sectionModel.find();
	}
	//MARK: Subjects
	public saveSubject(subject: iSubjectSchema) {
		const materia = new this.subjectModel(subject);
		return materia.save();
	}
	public async getSubjects() {
		return this.subjectModel.find().populate<iSection>("sections");
	}
	//MARK: Careers

	public saveSchedule(user: iUser, sections: Section[]) {}
}
