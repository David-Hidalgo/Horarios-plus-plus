import mongoose, { mongo } from "mongoose";
import {
	iSession,
	iSection,
	iSubject,
	iUser,
	iCareer,
	Section,
} from "./../models/classes";
import { Career, Schedule, Session, Subject, User } from "./../models/classes";

interface iSubjectSchema extends iSubject {
			sections: mongoose.Types.ObjectId[];
			careers: mongoose.Types.ObjectId[];
		}
export class DBStarter {
	public db: mongoose.Mongoose;
	public sessionModel;
	public sectionModel;
	public subjectModel;
	public careerModel;
	public userModel;
	public eventModel;
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
			type SectionModelType = mongoose.Model<iSection, {}, {}, {}, SectionHydratedDocument,iSection>;

		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		const sectionSchema = new mongoose.Schema<iSection,SectionModelType,{},{},{},{},iSection>({
			nrc: { type: String, required: true},
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

		interface iEvent {
			name: string;
			sessions: iSession[];
		}
		type EventHydratedDocument = mongoose.HydratedDocument<iEvent,{ 
			events: mongoose.Types.DocumentArray<iSession>
		}>;
		
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
				type eventModelType = mongoose.Model<iEvent, {}, {}, {}, EventHydratedDocument,iEvent>;

		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		const eventSchema = new mongoose.Schema<iEvent,eventModelType,{},{},{},{},iEvent>({
			name: { type: String, required: true },
			sessions: [
				sessionSchema
			],
		});

		this.eventModel = mongoose.model<iEvent,eventModelType>(
			"event",
			eventSchema,
		);

		

		const subjectSchema = new mongoose.Schema<iSubjectSchema>({
			name: { type: String, required: true },
			sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
			careers: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Career",
				required: true,
			}],
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


		const userSchema = new mongoose.Schema<iUser>({
			email: { type: String, required: true },
			password: { type: String, required: true },
			tipo: { type: Number, default: 0 },
			schedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
		});

		this.userModel = mongoose.model<iUser>("User",userSchema,);
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
		return new DBStarter(new db.Mongoose());
	}

	public static async disconnect() {
		const db = await require("mongoose");
		db.disconnect();
	}
	//MARK: secciones
	public async addSessionToSection(nrc: string, session: iSession) {
		const result=await this.sectionModel.findOne({ nrc: nrc }, 'sections');
		if (!result) {
			throw new Error("Section not found");
		}
		const sessionDoc = new this.sectionModel(session);
		result.sessions.push(sessionDoc);
		await result.save();		
	}
	public async deleteSessionFromSection(nrc: string, session: iSession) {
		const result=await this.sectionModel.findOne({ nrc: nrc }, 'sections');
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
	static async instanciarTodo(materias:Array<any>, sectionsArr:Array<any>) {
		const a =new Career("Ingeniería en Computación");
		let numeroSec = 0;
		let numeroSub = 0;
		const materiasArr = [];
		let sessionsArr: Session[] = [];
		let sectionsArrTemp = [];
		for await (const materia of materias) {
			await materia.populate("sections");
			const materiaTemp=new Subject(materia.name, [], a);
			for  (const section of materia.sections) {
				sessionsArr = [];
				for  (const sección of sectionsArr) {
					if (section._id.equals(sección._id)) {
						numeroSec++;
						sección.sessions.forEach((session:any) => {
							sessionsArr.push(new Session(session.start, session.end, session.day));
						});
						sectionsArrTemp.push(new Section(sección.nrc, sección.teacher, sessionsArr, materiaTemp));
					}
				}
			}
			if (numeroSec > 0) {
				materiaTemp.sections = sectionsArrTemp;
				numeroSub++;
				materiasArr.push(materiaTemp);
			}
			sectionsArrTemp = [];
			numeroSec = 0;
		}
	
		if(numeroSub < 1){
			throw new Error("FAILED TO GENERATE SCHEDULES: A subject is not found");
		}
		return materiasArr;
	}
	public async saveSchedule(owner:string,nrcs:string) {
		if (owner === undefined || nrcs === undefined) {
			console.error("FAILED TO GENERATE SCHEDULES: A value is undefined");
			return JSON.stringify(undefined);
		}

		const failed = false;
		const sections = await Promise.all(
			nrcs.split(",").map(async (nrc) => {
				return await this.sectionModel.find({ nrc: nrc });
			}),
		);
		const sectionsArr = sections.flat();
		//una busqueda en this.subjectModel para buscar el número de materias que contengan las secciones
		const materias = await this.subjectModel.find({});

		const materiasArr=await DBStarter.instanciarTodo(materias, sectionsArr);

		// console.error(`Numero de materias: ${numeroSub}`, `Numero de secciones: ${sectionsArr.length}`);
		// console.log("Las Materias Son\n",materiasArr,"\n");
		let schedules = new Array();
		const scheduleInicial = new Schedule(new User(owner,"algo",4,[]), []);
		console.log("Estos son las materias antes de recursivo \n",materiasArr,"\n");
		
		Schedule.recursiveSchedulePush(0, materiasArr, scheduleInicial, schedules);
		// console.log("Estos son los horarios antes de filtrador \n",schedules,"\n");
		schedules = Schedule.filtrarHorariosPorMaterias(schedules, materiasArr);
		schedules=schedules.filter((schedule) => {
			for (const section of schedule.sections) {
				if (section.sessions.length === 0) {
					return false;
				}else {
					return true;
				}
			}
		});
		console.log("\nhorarios después de filtrados\n",Bun.inspect(schedules,{colors:true,depth: 5}));
		
		// const schedules = await GenerateSchedules(sectionsArr, numeroSub);
		for (const schedule of schedules) {
			for (const section of schedule.sections) {
				section.subject.sections = [];
			}
		}

		return JSON.stringify(schedules);
	}
}
