import React, { type MouseEventHandler } from "react";

import CourseSemesterContainer from "./CourseSemesterContainer";
import NavigationBar from "./NavigationBar";
import "./TimeBlockInterface.css";
import { set } from "mongoose";


interface ISession {
	day: number;
	start: Date;
	end: Date;
	section: ISection;
}

interface ISection {
	nrc: string;
	teacher: string;
	subject: ISubject;
	sessionList: Array<ISession>;
}

interface ISubject {
	name: string;
	sectionList: Array<ISection>;
	//career: Array<ICareer>
}

interface ICareer {
	name: string;
	subjects: Array<ISubject>
}

interface EditableSectionContainerProperties {
	selectedSection: ISection;
	updateSectionBind: any;
	addClassBind: any;
	removeClassBind: any;
	updateClassBind: any;
	saveDataBind: any;
}

interface HourSelectorProperties {
	changeBind: any;
	dateBind: Date;
}

interface CourseProperties {
	displayCourse: ISubject;
	newSectionBind: any;
	removeSectionBind: any;
	selectSectionBind: any;
	editable: boolean;
	updateSelectedSubject: any;
	removeSubjectBind: any;
}

interface DaySelectorProperties {
	changeBind: any;
	classBind: ISession;
}

interface TimeBlockProperties {
	changeBind: any;
	classBind: ISession;
}

interface ActionableButton {
	action: MouseEventHandler;
}

function Course({
	displayCourse,
	newSectionBind,
	removeSectionBind,
	selectSectionBind,
	editable,
	updateSelectedSubject,
	removeSubjectBind,
}: CourseProperties) {
	function addNewSection() {
		displayCourse = newSectionBind(displayCourse);
	}

	function removeExistingSection(section: ISection) {
		displayCourse = removeSectionBind(displayCourse, section);
	}

	const [nameError, setNameError] = React.useState(false);
	const nameErrorMessage = "Nombre de curso ya existente";

	function updateSubject(event: any) {
		let newSubject = event.target.value;
		let newCourse: ISubject = displayCourse;
		newCourse = {
			...newCourse,
			name: newSubject,
		};
		if(updateSelectedSubject(displayCourse,newCourse)){
			setNameError(false);
			displayCourse = newCourse;
		}else{
			setNameError(true);
		}
	}

	function deleteSubject() {
		removeSubjectBind(displayCourse, displayCourse.sectionList[0]);
	}

	return (
		<div>
			<div className="course">
				{!editable && (
				<><div className="course-name">{displayCourse.name}</div>
				<div className="add-section">
					<button onClick={addNewSection} type="button">
						Añadir Seccion
					</button>
				</div></>
				)}
				{editable && (
					<> 
					<div className="inputs">
						{nameError && <div className="name-error">{nameErrorMessage}</div>}
						<input className="course-name"
							value={displayCourse.name}
							onChange={updateSubject}
							placeholder="Nombre de la materia"
							type="text"
						/>
					</div>
					<div className="delete-section">
						<button onClick={deleteSubject} type="button">
							Remover Curso
						</button>
					</div></>
				)}
				
			</div>
			<div>
				{displayCourse?.sectionList.map((value) => {
					return (
						<div className="section">
							<div>
								<button onClick={() => selectSectionBind(value)}>
									NRC: {value.nrc}
								</button>
							</div>
							{!editable && (
							<div className="delete-section">
								<button onClick={() => removeExistingSection(value)}>
									{" "}
									Remover{" "}
								</button>
							</div>
						)}
							
						</div>
					);
				})}
			</div>
		</div>
	);
}

function HourSelector({ changeBind, dateBind }: HourSelectorProperties) {
	// we use new Date() to avoid changing it HERE by reference
	// Since we want to change it in the changeBind, not here

	const handleHourChange = (event: any) => {
		let toSend = new Date(0);
		toSend.setHours(event.target.value);
		toSend.setMinutes(dateBind.getMinutes());
		changeBind(toSend);
	};

	const handleMinutesChange = (event: any) => {
		let toSend = new Date(0);
		toSend.setHours(dateBind.getHours());
		toSend.setMinutes(event.target.value);
		changeBind(toSend);
	};

	return (
		<div className="hour-selection-container">
			<select value={dateBind.getHours()} onChange={handleHourChange}>
				<option value="6">6</option>
				<option value="7">7</option>
				<option value="8">8</option>
				<option value="9">9</option>
				<option value="10">10</option>
				<option value="11">11</option>
				<option value="12">12</option>
				<option value="13">13</option>
				<option value="14">14</option>
				<option value="15">15</option>
				<option value="16">16</option>
				<option value="17">17</option>
				<option value="18">18</option>
				<option value="19">19</option>
				<option value="20">20</option>
			</select>
			<select value={dateBind.getMinutes()} onChange={handleMinutesChange}>
				<option value="00">00</option>
				<option value="15">15</option>
				<option value="30">30</option>
				<option value="45">45</option>
			</select>
		</div>
	);
}

function DaySelector({ classBind, changeBind }: DaySelectorProperties) {
	const handleDayChange = (event: any) => {
		changeBind(classBind, { ...classBind, day: event.target.value });
	};

	return (
		<select value={classBind.day} onChange={handleDayChange}>
			<option value="1">Lunes</option>
			<option value="2">Martes</option>
			<option value="3">Miercoles</option>
			<option value="4">Jueves</option>
			<option value="5">Viernes</option>
			<option value="6">Sábado</option>
			<option value="7">Domingo</option>
		</select>
	);
}


function TimeBlock({ changeBind, classBind }: TimeBlockProperties) {
	const [showTimeError, setShowTimeError] = React.useState(false);
	const timeErrorMessage = "La hora de inicio no puede ser mayor a la hora de fin";
	function updateStart(start: Date) {
		if(changeBind(classBind, { ...classBind, start: start })===1){
			setShowTimeError(true);
		}else{setShowTimeError(false);}
	}

	function updateEnd(end: Date) {
		if(changeBind(classBind, { ...classBind, end: end })===1){
			setShowTimeError(true);
		}else{setShowTimeError(false);}
	}

	return (<><div className="timeblock-container">
				{showTimeError && <div className="time-error">{timeErrorMessage}</div>}
				<li className="timeblock-container-selector">
					<DaySelector changeBind={changeBind} classBind={classBind} />
					<HourSelector changeBind={updateStart} dateBind={classBind.start} />
					<HourSelector changeBind={updateEnd} dateBind={classBind.end} />
				</li>
			</div>
			</>
	);
}

function SaveButton({ action }: ActionableButton) {
	return (
		<div className="save-button">
			<button onClick={action} type="button">
				Guardar
			</button>
		</div>
	);
}

function EditableSectionContainer({
	selectedSection,
	updateSectionBind,
	addClassBind,
	removeClassBind,
	updateClassBind,
	saveDataBind,
}: EditableSectionContainerProperties ){
	
	function addNewClass() {
		addClassBind(selectedSection);
	}

	function removeClass(session: ISession) {
		removeClassBind(selectedSection, session);
	}

	function updateClassTime(oldSession: ISession, newSession: ISession) {
		if(updateClassBind(selectedSection, oldSession, newSession)===undefined){
			return 1;
		}else{return 0}	
	}

	function updateSectionNRC(event: any) {
		let newNRC = event.target.value;
		let newSection: ISection = selectedSection;
		newSection = {
			...newSection,
			nrc: newNRC,
		};
		updateSectionBind(selectedSection, newSection);
	}

	function updateSectionTeacher(event: any) {
		let newTeacher = event.target.value;
		let newSection: ISection = selectedSection;
		newSection = {
			...newSection,
			teacher: newTeacher,
		};
		updateSectionBind(selectedSection, newSection);
	}

	
	return (
		<div className="editable-section-container">
			<div className="editable-section-header">
				<div className="basic-info">{selectedSection.subject.name}</div>
				<div>
					NRC:{" "}
					<input
						value={selectedSection.nrc}
						onChange={updateSectionNRC}
						type="text"
					/>
				</div>
			</div>
			<div className="teacher-container">
				Teacher:{" "}
				<input
					value={selectedSection.teacher}
					onChange={updateSectionTeacher}
					type="text"
				/>
			</div>
			<div className="day-container">
				Dias: <button onClick={() => addNewClass()}>Añadir</button>
			</div>
			<div>
				{selectedSection.sessionList.map((value) => {
					return (
						<div className="day-buttons">
							<TimeBlock changeBind={updateClassTime} classBind={value} />
							<div className="delete-day">
								<button onClick={() => removeClass(value)}> Remover </button>
							</div>
						</div>
					);
				})}
			</div>
			<SaveButton action={saveDataBind} />
		</div>
	);
}

export default function TimeBlockInterface() {
	const [selectedSection, setSelectedSection] = React.useState<
		ISection | undefined
	>(undefined);
	const [loadedSubjects, setLoadedSubjects] = React.useState<Array<ISubject>>();

	let updating = false;

	// 1- get every nrc and add to array
	// 2- compare n number to the array
	// 3- if num, +1, remove element and again
	// repeat until n not in list

	function findFreeNRC(): Number {
		let newNRC = 1;
		let sectionNRC: string[] = [];
		loadedSubjects?.forEach((x) => {
			x.sectionList.forEach((w) => {
				sectionNRC.push(w.nrc);
			});
		});
		while (true) {
			if (sectionNRC.includes(newNRC.toString())) {
				newNRC += 1;
			} else {
				console.log("Returning NRC " + newNRC);
				return newNRC;
			}
		}
	}

	React.useEffect(() => {
		(async () => {
			if (loadedSubjects) {
				return;
			}
			setLoadedSubjects(await loadFromServer());
		})();
	});

	async function loadSectionFromID(
		subject: ISubject,
		id: string,
	): Promise<ISection> {
		const section: ISection = await fetch(
			`http://127.0.0.1:4000/api/section/get_sections_from_id?id=${id}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error("No se pudo obtener la seccion", e);
			})
			.then((data) => {
				const newSection: ISection = {
					nrc: data.nrc,
					teacher: data.teacher,
					sessionList: [],
					subject: subject,
				};
				return newSection;
			});
		return section;
	}

	async function loadSectionsFromIdList(subject: ISubject, Ids: string[]) {
		if (Ids === undefined || Ids.length === 0) {
			return [];
		}
		const promises = Ids.map(async (id) => {
			return loadSectionFromID(subject, id);
		});
		return Promise.all(promises);
	}

	async function loadFromServer(): Promise<ISubject[]> {
		const subjects: Promise<ISubject>[] = await fetch(
			"http://127.0.0.1:4000/api/subjects/get_subjects",
			{
				headers: { Accept: "application/json" },
			},
		)
			.then((response) => response.json())
			.then((data: any[]) => {
				return data.map(async (subject) => {
					let newSubject: ISubject = {
						//career: [],
						name: subject.name,
						sectionList: await loadSectionsFromIdList(
							subject,
							subject.sections,
						),
					};
					console.log(newSubject);
					return newSubject;
				});
			});
		return Promise.all(subjects);
	}

	async function fetchSessionFromId(
		id: string,
		section: ISection,
	): Promise<ISession> {
		return await fetch(
			`http://127.0.0.1:4000/api/session/get_sessions_from_id?id=${id}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error(e);
			})
			.then((data) => {
				let newSession: ISession = {
					day: data.day,
					start: new Date(data.start),
					end: new Date(data.end),
					section: section,
				};
				return newSession;
			});
	}

	async function fetchSessionsFromSection(section: ISection) {
		return await fetch(
			`http://127.0.0.1:4000/api/session/get_sessions_from_section?nrc=${section.nrc}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error("No se pudo obtener las sessiones de la seccion");
			})
			.then(async (data) => {
				if (data === undefined) {
					return;
				}
				let newSection: ISection = {
					nrc: section.nrc,
					teacher: section.teacher,
					subject: section.subject,
					sessionList: await Promise.all(
						data.map(
							async (id: string) => await fetchSessionFromId(id, section),
						),
					),
				};
				setSelectedSection(newSection);
			});
	}

	function changeSelectedSection(section: ISection) {
		fetchSessionsFromSection(section);
	}

	async function saveSectionToSubject(subject: ISubject, section: ISection) {
		updating = true;
		if (subject === undefined || section === undefined) {
			updating = false;
			return;
		}
		return await fetch(
			`http://127.0.0.1:4000/api/section/add_section_to_subject?nrc=${section.nrc}&teacher=${section.teacher}&subjectName=${subject.name}`,
			{headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error(e);
				console.error("No se pudo agregar a la base de datos");
			})
			.then((data) => {
				if (data === undefined) {
					return;
				}
				setLoadedSubjects(
					loadedSubjects?.map((x) => {
						if (x !== subject) return x;
						return { ...x, sectionList: x.sectionList.concat([section]) };
					}),
				);
			})
			.finally(() => {
				updating = false;
			});
	}

	// Adds new section to a specified course
	function addSectionToCourse(subject: ISubject) {
		if (updating === true) {
			return;
		}
		let createdSection: ISection = {
			subject: subject,
			nrc: findFreeNRC().toString(),
			sessionList: [],
			teacher: " ",
		};
		saveSectionToSubject(subject, createdSection);
	}

	async function deleteSectionFromDatabase(section: ISection) {
		await await fetch(
			`http://127.0.0.1:4000/api/section/delete_section?nrc=${section.nrc}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error("ERROR while trying to remove section ", section);
				console.error(e);
			});
	}

	function removeSectionFromCourse(
		course: ISubject,
		section: ISection,
	): ISubject {
		let ret: ISubject = course;
		setLoadedSubjects(
			loadedSubjects?.map((x) => {
				if (x !== course) return x;
				ret = {
					...x,
					sectionList: x.sectionList.filter((y) => y !== section),
				};
				return ret;
			}),
		);

		deleteSectionFromDatabase(section);

		if (section === selectedSection) {
			setSelectedSection(undefined);
		}
		return ret;
	}

	async function updateSectionServer(
		oldSection: ISection,
		newSection: ISection,
	) {
		updating = true;

		let allow_change = true;
		return await fetch(
			`http://127.0.0.1:4000/api/section/update_section?oldnrc=${oldSection.nrc}&nrc=${newSection.nrc}&teacher=${newSection.teacher}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error actualizando base de datos ", e);
				allow_change = false;
			})
			.then((data) => {
				if (data === undefined) {
					console.error("No se pudo actualizar la seccion");
					return;
				}
				console.log(data);
				allow_change = true;
			})
			.finally(() => {
				console.log("Updating section");
				let newValue = allow_change ? newSection : oldSection;
				setLoadedSubjects(
					loadedSubjects?.map((x) => {
						x.sectionList.forEach(element => {
							if (element.nrc===oldSection.nrc){ 
								x.sectionList[x.sectionList.indexOf(element)] = newValue;
								console.log("Se actualizo la seccion "+element.nrc+" a "+newValue.nrc);
								}
								
							});
						return x;
						})
				);
				setSelectedSection(newValue);
				updating = false;
			});
	}

	function updateSectionFromCourse(oldSection: ISection, newSection: ISection) {
		if (updating) {
			return;
		}
		updateSectionServer(oldSection, newSection);
	}

	async function deleteSessionFromSection(
		session: ISession,
		section: ISection,
	) {
		let saved = true;
		await fetch(
			`http://127.0.0.1:4000/api/session/delete_session?nrc=${
				section.nrc
			}&day=${
				session.day
			}&start=${session.start.getTime()}&end=${session.end.getTime()}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				saved = false;
				console.error("ERROR unable to delete session from section ", e);
			})
			.finally(() => {
				if (saved) {
					changeSelectedSection(section);
				}
			});
	}

	async function saveNewSessionToSection(session: ISession, section: ISection) {
		let saved = true;
		await fetch(
			`http://127.0.0.1:4000/api/session/add_session_to_section?day=${
				session.day
			}&start=${session.start.getTime()}&end=${session.end.getTime()}&nrc=${
				section.nrc
			}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				saved = false;
				console.error("ERROR unable to create section ", e);
			})
			.then((data) => {
				if (saved) {
					changeSelectedSection(section);
				}
			});
	}

	function addClassToSection(section: ISection): ISection {
		function ReturnDate(hours: number, minutes: number): Date {
			let ret = new Date(0);
			ret.setHours(hours);
			ret.setMinutes(minutes);
			return ret;
		}

		let newSession: ISession = {
			day: 1,
			end: ReturnDate(6, 15),
			start: ReturnDate(6, 0),
			section: section,
		};
		section.sessionList.push(newSession);

		if (section.sessionList.includes(newSession)) {
			saveNewSessionToSection(newSession, section);
		}
		return section;
	}

	function removeClassFromSection(
		section: ISection,
		session: ISession,
	): ISection {
		section.sessionList = section.sessionList.filter((y) => y !== session);
		deleteSessionFromSection(session, section);
		return section;
	}

	async function updateClassFromServer(
		oldSession: ISession,
		newSession: ISession,
		section: ISection,
	) {
		const variables =
			`oldday=${oldSession.day}&` +
			`oldstart=${oldSession.start.getTime()}&` +
			`oldend=${oldSession.end.getTime()}&` +
			`newday=${newSession.day}&` +
			`newstart=${newSession.start.getTime()}&` +
			`newend=${newSession.end.getTime()}&` +
			`nrc=${section.nrc}`;

		let changed = true;
		await fetch(
			`http://127.0.0.1:4000/api/session/updateSession?${variables}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				changed = false;
				console.error("ERROR updating session ", e);
			})
			.finally(() => {
				changeSelectedSection(section);
			});
	}

	function updateClassFromSection(
		section: ISection,
		oldSession: ISession,
		newSession: ISession,
	) {
		if (
			newSession.start.getHours() * 60 + newSession.start.getMinutes() >=
			newSession.end.getHours() * 60 + newSession.end.getMinutes()
		) {
			return undefined;
		}
		if (oldSession !== newSession) {
			let newSection: ISection = section;
			newSection.sessionList[newSection.sessionList.indexOf(oldSession)] =
				newSession;
			updateClassFromServer(oldSession, newSession, newSection);
		}
		return section;
	}
	const [editable, setEditable] = React.useState(false);

	async function updateSubjectServer(oldSubject: ISubject, newSubject: ISubject) {
		updating = true;
		let allow_change = true;
		const newName= newSubject.name;
		console.log("Actualizando nombre de "+oldSubject.name+" a '"+newName+"'");
		
		return await fetch(
			`http://127.0.0.1:4000/api/subjects/update_subject?oldname=${oldSubject.name}&newname=${newName}&section=${oldSubject.sectionList}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error actualizando base de datos ", e);
				allow_change = false;
			})
			.then((data) => {
				console.log(data);
			})
			.finally(() => {
				let newValue = allow_change ? newSubject : oldSubject;
				setLoadedSubjects(
					loadedSubjects?.map((x) => {
						if (x !== oldSubject) return x;
						return newValue;
					})
				);
				updating = false;
			});
		
	}
	
	function updateSubjectFromName(oldSubject: ISubject, newSubject: ISubject) {
		if(oldSubject.name !== newSubject.name){
			console.log("Nombre distinto");
			if(loadedSubjects?.find((x) => x.name === newSubject.name) !== undefined){
				console.log("Nombre repetido");
				return false;
			}else{
				updateSubjectServer(oldSubject, newSubject);
				return true;
			}
		}else{
			console.log("Nombre igual");
			updateSubjectServer(oldSubject, newSubject);
			return true;
		}
	}

	async function addSubjectServer(newSubject: ISubject) {
		updating = true;
		return await fetch(`http://127.0.0.1:4000/api/subjects/create_subject?name=${newSubject.name}`,
			{ headers: { Accept: "application/json" } },)
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error al crear curso ", e);
			})
			.then((data) => {
				if (data === undefined) {
					console.error("No se pudo crear el curso");
					return;
				}
				console.log(data);
				setLoadedSubjects(loadedSubjects?.concat([newSubject]));
			})
	}
	function generateName(){
		let name = "Nuevo Curso ";
		let i = 1;
		while(loadedSubjects?.find((x) => x.name === name+i) !== undefined){
			i++;
		}
		return name+i;
	}
	function addSubject(){
		setEditable(true);
		let newSubject: ISubject = {
			//career: [],
			name: generateName(),
			sectionList: [],
		};
		addSubjectServer(newSubject);
	
	}

	async function deleteSubjectFromDatabase(subject: ISubject){
		return await fetch(`http://127.0.0.1:4000/api/subjects/delete_subject?subjectName=${subject.name}&subject=${subject}`,
			{ headers: { Accept: "application/json" } },)
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error al eliminar curso ", e);
			})
			.then((data) => {
				if (data === undefined) {
					console.error("No se pudo eliminar el curso");
					return;
				}
				if(data.message==="Subject deleted successfully")
					console.log("Curso eliminado con exito");
			})
	}

	function deleteSubject(subject: ISubject){
		subject.sectionList.forEach((x) => {
			if (x === selectedSection) {
				setSelectedSection(undefined);
			}
		});
		setLoadedSubjects(loadedSubjects?.filter((x) => x !== subject));
		
		 deleteSubjectFromDatabase(subject);

	}

	return (
		<div>
			<NavigationBar />
			<div className="main-container">
				<div className="course-box-container">
					<CourseSemesterContainer />
					<div>
						{loadedSubjects?.map((value) => {
							return (
								<Course
									displayCourse={value}
									newSectionBind={addSectionToCourse}
									removeSectionBind={removeSectionFromCourse}
									selectSectionBind={changeSelectedSection}
									editable={editable}
									updateSelectedSubject={updateSubjectFromName}
									removeSubjectBind={() => {deleteSubject(value)}}
								/>
							);
						})}
					</div>
					{!editable && (<div className="add-subject">
						<button onClick={() => {addSubject()}} type="button">
							Añadir Curso
						</button>

					</div>)}
					{editable && (<div className="save-subject">
						<button onClick={() => {setEditable(false);}} type="button">
							Guardar
						</button>

					</div>)}
					
				</div>
				<div className="section-edit-container">
					{selectedSection !== undefined && (
						<EditableSectionContainer
							selectedSection={selectedSection}
							updateSectionBind={updateSectionFromCourse}
							addClassBind={addClassToSection}
							removeClassBind={removeClassFromSection}
							updateClassBind={updateClassFromSection}
							saveDataBind={() => {window.location.href = "/time_blocks"}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
