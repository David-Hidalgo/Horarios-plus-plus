import React from "react";
import { useState } from "react";

import NavigationBar from "./NavigationBar";
import "./MyScheduleInterface.css";

import type {
	ISchedule,
	ISection,
	ISubject,
	ISession,
} from "./ScheduleViewer.tsx";
import ScheduleViewer from "./ScheduleViewer.tsx";

const email = sessionStorage.getItem("login");

export default function MySheduleInterface() {
	const [loadedSchedule, setLoadedSchedule] = React.useState<ISchedule | undefined>();

	async function fetchSubjectFromNRC(
		nrc: string,
		section: ISection,
	): Promise<ISubject> {
		return await fetch(
			`http://127.0.0.1:4000/api/subjects/get_subject_from_nrc?nrc=${nrc}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.then((data) => {
				const newSubject: ISubject = {
					color: undefined,
					name: data.name,
				};
				return newSubject;
			});
	}

	async function loadSectionFromID(id: string): Promise<ISection> {
		let fetched = true;
		const section: ISection = await fetch(
			`http://127.0.0.1:4000/api/section/get_sections_from_id?id=${id}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				fetched = false;
				console.error("ERROR Loading section ", e);
			})
			.then(async (data) => {
				const newSection: ISection = {
					nrc: data.nrc,
					sessionList: [],
					subject:{color: undefined, name: ""},
				};
				newSection.sessionList= data.sessions.map((session:ISession) => {
					return {
						day: session.day,
						start: new Date(session.start),
						end: new Date(session.end),
						section: newSection
					};
				})				
				newSection.subject = await fetchSubjectFromNRC(data.nrc, newSection);
				return newSection;
			});
		return section;
	}

	async function getSchedule() {
		let fetched = true;
		return await fetch(
			`http://127.0.0.1:4000/api/schedule/get_schedule_from_owner?owner=${email}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				fetched = false;
				console.error("ERROR loading user schedule ", e);
			})
			.then(async (data) => {
				if (!fetched) {
					return { sectionList: [] };
				}
				console.log(data);
				const newSchedule: ISchedule = {
					sectionList: await Promise.all(
						data.map(async (id: string) => {
							return await loadSectionFromID(id);
						}),
					),
				};
				console.log(newSchedule);
				return newSchedule;
			});
	}

	React.useEffect(() => {
		(async () => {
			if (loadedSchedule) {
				return;
			}
			setLoadedSchedule(await getSchedule());			
		})();
	});

	return (
		<div>
			<NavigationBar />
			<div className="main-container">
				{loadedSchedule !== undefined && (
					<ScheduleViewer loadedSchedule={loadedSchedule} />
				)}
			</div>
		</div>
	);
}
