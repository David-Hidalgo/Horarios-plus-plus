import type { DBController } from "../controllers/db";
import Elysia, { t } from "elysia";

export const pluginSection = <T extends string>(
	config: { prefix: T },
	db: DBController,
) =>
	new Elysia({ name: "sectionRoutes", seed: config })
		.get(`${config.prefix}/hi`, () => "Hi")
		.get("/api/section/get_sections_from_id", async ({ query }) => {
			// console.log(Bun.inspect(query.id));

			if (query.id === undefined) {
				console.error("GET_SECTIONS_FROM_ID ERROR: id is undefined");
				return undefined;
			}

			const section = await db.sectionModel.findById(query.id);
			if (section === undefined|| section === null) {
				console.log("GET_SECTIONS_FROM_ID ERROR: no section has this id: ",query.id);
				return undefined;
			}

			return JSON.stringify(section);
		})
		.get("/api/section/get_sections_from_subject", async ({ query }) => {
			if (query.subjectName === undefined) {
				return undefined;
			}

			const subject = (
				await db.subjectModel.find({ name: query.subjectName })
			).at(0);
			if (subject === undefined) {
				return undefined;
			}

			return subject.sections;
		})
		.get("/api/section/add_section_to_subject", async ({ query }) => {
				if (
					query.nrc === undefined ||
					query.teacher === undefined ||
					query.subjectName === undefined
				) {
					console.error("Alguno de los argumentos es undefined");
					return undefined;
				}

				if (await db.sectionModel.exists({ nrc: query.nrc })) {
					console.error(
						`El NRC ya se encuentra en la base de datos ${query.nrc}`,
					);
					return undefined;
				}

				const subject = (
					await db.subjectModel.find({ name: query.subjectName })
				).at(0);
				if (subject === undefined) {
					console.error(`No se encontro ${query.subjectName}`);
					return undefined;
				}

				const newSection = new db.sectionModel({
					nrc: `${query.nrc}`,
					teacher: `${query.teacher}`,
					sessions: [],
				});
				await newSection.save();

				subject.sections.push(newSection._id);
				await subject.save();

				return JSON.stringify(newSection);
			},
			{ query:
				t.Object({
					nrc: t.String(),
					teacher: t.String(),
					subjectName: t.String(),
				}),
			 },
		)
		.get(
			"/api/section/update_section",
			async ({ query }) => {
				const oldNRC = query.oldnrc;
				if (oldNRC === undefined) {
					console.log("Could not update section, OLDNRC is undefined");
					return undefined;
				}

				if (query.oldnrc !== query.nrc) {
					if (await db.sectionModel.exists({ nrc: query.nrc })) {
						console.log(
							`El NRC ya se encuentra en la base de datos ${query.nrc}`,
						);
						return undefined;
					}
				}

				const filter = { nrc: oldNRC };
				const newSection = {
					nrc: `${query.nrc}`,
					teacher: `${query.teacher}`,
				};
				const oldSection = await db.sectionModel.findOneAndUpdate(
					filter,
					newSection,
				);
				if (oldSection === undefined) {
					console.log("Could not find and update oldNRC: ", oldNRC);
					return oldSection;
				}

				console.log("Updated section ", oldSection, " to ", newSection);
				return newSection;
			},
			{
				query: t.Object({
					oldnrc: t.String(),
					teacher: t.String(),
					nrc: t.String(),
				}),
			},
		)
		.delete("/api/section/delete_section", async ({ query }) => {
			const toDeleteNRC = query.nrc;
			if (toDeleteNRC === undefined) {
				console.log("DELETE_SECTION ERROR: nrc is undefined ", toDeleteNRC);
				return undefined;
			}

			const section = await db.sectionModel.findOne({ nrc: toDeleteNRC });
			if (section === undefined || section === null) {
				console.log("DELETE_SECTION ERROR: no section has nrc ", toDeleteNRC);
				return undefined;
			}

			const users = await db.userModel.find();
			users.forEach(async (user) => {
				user.schedule.id(section.id)?.deleteOne();
			});
			db.subjectModel
				.findOne({ sections: section.id })
				.populate("sections")
				.exec()
				.then((subject) => {
					if (subject === undefined || subject === null) {
						console.log(
							"DELETE_SECTION ERROR: no subject has section ",
							section,
						);
						return undefined;
					}
					subject.id(section.id)?.deleteOne();
				});
			const response = await section.deleteOne();
			return response;
		});
