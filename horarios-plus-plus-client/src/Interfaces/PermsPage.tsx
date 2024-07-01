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

interface IUser {
	email: string;
	tipo: string;
	permiso: boolean;
}

interface UserContainerParams {
	user: IUser;
	updatePermision: any;
	updateRol: any;

}

function UserContainer({user,updatePermision,updateRol}:UserContainerParams) {
	const username = user.email.substring(0, user.email.indexOf("@"));
	const [editable, setEditable] = React.useState(false);

	function updatePermisionL(permiso:string){
		updatePermision(user.email,permiso);

	}

	function updateRolL(rol:string){
		updateRol(user.email,rol);
	}

	return (
		<section className="user">
			<div className="user-email">{username}</div>
			<select form="formUsuarios" name="roles-usuario" defaultValue={user.tipo} id="roles-usuario" onChange={(e)=>{updateRolL(e.target.value)}}>
				<option value="estudiante">Estudiante</option>
				<option value="profesor">Profesor</option>
				<option value="admin">Admin</option>
			</select >
			<select form="formUsuarios" name="permiso" defaultValue={user.permiso?"si":"no"} id="permiso" onChange={(e)=>{updatePermisionL(e.target.value)}}>
				<option value="si">Sí</option>
				<option value="no">No</option>
			</select>
		</section>
	);
}



export default function PermsInterface() {
	const [loadedUsers, setLoadedUsers] = React.useState<Array<IUser>>();
	const [changedUsers, setChangedUsers] = React.useState<Array<IUser>>(new Array<IUser>());
	const [editable, setEditable] = React.useState(false);

		React.useEffect(() => {
			(async () => {
				if (loadedUsers) {
					return;
				}
				setLoadedUsers(await fetchUsers());
			})();
		});

	async function fetchUsers() {
		const users = await fetch("http://localhost:4000/api/get_usuarios", {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((_e) => {
				console.log("no se pudo cargar la lista de usuarios");
			})
			.then((data) => {
				console.log("a ver si llego aquí",data);
				
				return data.map(async (user:{email:string,tipo:number}) => {
					let tipo="estudiante";
					let permiso=false;
					if(user.tipo===1){
						tipo="estudiante";
						permiso=true;
					}else if(user.tipo===2){
						tipo = "profesor";
						permiso=false;
					}else if(user.tipo===3){
						tipo = "profesor";
						permiso=true;
					}else if(user.tipo===4){
						tipo = "admin";
					}

					const newUser: IUser = {
						//career: [],
						email: user.email,
						tipo: tipo,
						permiso: permiso,
					};
					console.log(newUser);
					return newUser;
				});
			});
		return Promise.all(users);
	}

	function updateChangedUser(user:IUser){
		if (!changedUsers?.includes(user)) {
			setChangedUsers([...(changedUsers), user]);
		}
		console.log(changedUsers);
	}

	function updatePermision(email:string,permiso:string){
		setLoadedUsers(
			loadedUsers?.map((user)=>{
				if(user.email===email){
					user.permiso=permiso==="si";
					updateChangedUser(user);
				}
				return user;
			})
		)
	}

	function updateRol(email:string,rol:string){
		setLoadedUsers(
			loadedUsers?.map((user)=>{
				if(user.email===email){
					user.tipo=rol;
					updateChangedUser(user);
				}
				return user;
			})
		)
	}

	function transformarEnEnviar() {
		return {
			usuarios: changedUsers.map((user) => {
				let tipo=0;
				if (user.permiso) {
					user.tipo === "estudiante" ? tipo=1 : user.tipo === "profesor" ? tipo=3 : tipo=4;
				}else
					user.tipo === "estudiante" ? tipo=0 : user.tipo === "profesor" ? tipo=2 : tipo=4;

				return { email: user.email, tipo: tipo};
			}),
		};
	}

	function handleSubmit(e) {
    // Evita que el navegador recargue la página
    e.preventDefault();
    // Lee los datos del formulario
    const form = e.target;
    const formData = new FormData(form);
    console.log(formData.getAll('email'));
		console.log(formData.getAll('permiso'));
		console.log(formData.getAll('roles-usuario'));

		// Puedes pasar formData como cuerpo del fetch directamente:
		console.log(transformarEnEnviar());
		

    fetch('http://127.0.0.1:4000/api/update_users', { method: "PUT", body: JSON.stringify(transformarEnEnviar()) });
    // Puedes generar una URL de él, como hace el navegador por defecto:
	}

	return (
		<div>
			<NavigationBar />
			<main className="main-container">
				<div className="perms-container">
					<div className="Titulo"><h1>Permisos</h1></div>
					
					<section className="Usuarios">
						<form id="formUsuarios" method="PUT" onSubmit={handleSubmit} >
							<h2>Usuarios</h2>
							{
								loadedUsers?.map((user) => {
									return (
										<UserContainer user={user} updatePermision={updatePermision} updateRol={updateRol}/>
									);
								})
							}
							<button type="submit">Guardar</button>
						</form>
					</section>
				</div>
			</main>
		</div>
	);
}

