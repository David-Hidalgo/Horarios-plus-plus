import React from "react";

import NavigationBar from "./NavigationBar";
import "./SignUpInterface.css";

export default function SignUpInterface() {
	const [email, setEmail] = React.useState();
	const [password, setPassword] = React.useState();
	

	function handleEmail(event: any) {
		setEmail(event.target.value);
	}
	function handlePassword(event: any) {
		setPassword(event.target.value);
	}

	async function SendCredentialsDatabase() {
		return await fetch(
			`http://127.0.0.1:4000/api/sign_up?email=${email}&password=${password}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.log("Could not send sign up to database");
			})
			.then((data) => {
				console.log(data);
			})
			.finally(() => {
				window.location.href = "/login";
			});
	}
	const handleClick =() => {
		if(!showMessage) { 
		  setErrorMessage("Por favor ingrese un correo valido");
		  setShowError(true);
		}else{
		  SendLoginDatabase()
			.then(async(data) => {
			  if (data.message === "successful") {
				
				setShowError(false);
				setShowSuccesful(true);
				await timeout(1500);
				window.location.href = "/";
				
			  } else {
				 if (data.message === "User doesn't exist") {
				  setErrorMessage("Usuario no encontrado");
				} else if (data.message === "password doesn't match") {
				  setErrorMessage("Contraseña incorrecta");
				} else {
				  setErrorMessage("Error desconocido");
				}
				setShowError(true);
			  }
			})
			.catch(() => {
			  setShowError(true);
			});
		}
	  };

	return (
		<div>
			<NavigationBar />
			<div className="main-container">
				<div className="signup-container">
					<div className="signup-bg">
						<div className="signup-header">Horarios Plus Plus</div>
						<div className="signup-user">
							<input
								value={email}
								onChange={handleEmail}
								placeholder="Introduzca un email"
								type="text"
							/>
						</div>
						<div className="signup-password">
							<input
								value={password}
								onChange={handlePassword}
								placeholder="Introduzca una contraseña"
								type="text"
							/>
						</div>
						<div className="signup-button">
							<button onClick={handleClick} type="button">
								Crear Cuenta
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
