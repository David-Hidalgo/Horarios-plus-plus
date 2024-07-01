import NavigationBar from "./NavigationBar.tsx";
import "./PermsPage.css";
import React from "react";
import { useState } from "react";
import { regExpEmail } from "./helpers.tsx";

interface ISection {
	nrc: number;
}

interface ISubject {
	name: string;
	sectionList: Array<ISection>;
}

interface CourseProperties {
	displayCourse: ISubject;
	newSectionBind: (course: ISubject) => ISubject;
	removeSectionBind: (course: ISubject, section: ISection) => ISubject;
	selectSectionBind: (section: ISection) => void;
	editable: boolean;
	updateSelectedSubject: (oldSubject: ISubject, newSubject: ISubject) => boolean;
	removeSubjectBind: (subject: ISubject, section: ISection) => void;
}



export default function PermsInterface() {
	const [loadedSubjects, setLoadedSubjects] = React.useState<Array<ISubject>>();
	const [editable, setEditable] = React.useState(false);

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
			if (updateSelectedSubject(displayCourse, newCourse)) {
				setNameError(false);
				displayCourse = newCourse;
			} else {
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
						<>
							<div className="course-name">{displayCourse.name}</div>
							<div className="add-section">
								<button onClick={addNewSection} type="button">
									Añadir Seccion
								</button>
							</div>
						</>
					)}
					{editable && (
						<>
							<div className="inputs">
								{nameError && (
									<div className="name-error">{nameErrorMessage}</div>
								)}
								<input
									className="course-name"
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
							</div>
						</>
					)}
				</div>
			</div>
		);
	}

	async function fetchUsers() {
		return await fetch("http://localhost:4000/api/get_usuarios", {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((_e) => {
				console.log("Could not send login to database");
			})
			.then((data) => {
				for (const key in data) {
					if (Object.prototype.hasOwnProperty.call(data, key)) {
						const element = data[key];
						//returns a tsx wich is a div wich contains a p with the email a select with the type of user and a select with the permission type 0,2,4 are the types of users

						//0 is a student, 2 is a teacher and 4 is an admin
						//1 is the permission to crud the events and 3 is the permission to crud the events for a professor
						console.log(element.email);
						console.log(element.tipo);
						console.log(element.permiso);

						return (
							<div>
								<p>{element.email}</p>
								<select>
									<option value="usuario">Usuario</option>
									<option value="profesor">Profesor</option>
									<option value="admin">Admin</option>
								</select>
								<select>
									<option value="si">Sí</option>
									<option value="no">No</option>
								</select>
							</div>
						);
					}
				}
			});
	}

	return (
		<div>
			<NavigationBar />
			<main className="main-container">
				<div className="login-container">
					<h1>Permisos</h1>
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
									removeSubjectBind={() => {
										deleteSubject(value);
									}}
								/>
							);
						})}
					</div>
					<select>
						<option value="usuario">Usuario</option>
						<option value="profesor">Profesor</option>
						<option value="admin">Admin</option>
					</select>
					<select>
						<option value="si">Sí</option>
						<option value="no">No</option>
					</select>
					<div></div>
				</div>
			</main>
		</div>
	);
}
