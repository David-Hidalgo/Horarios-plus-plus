import React from "react";
import { regExpEmail } from  "./helpers.tsx";
import NavigationBar from "./NavigationBar";
import "./SignUpInterface.css";

export default function SignUpInterface() {
	const [email, setEmail] = React.useState();
	const [password, setPassword] = React.useState();
	const [showError, setShowError] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState("");

	const [showSuccessful, setShowSuccesful] = React.useState(false);
	const successfulMessage = "Se ha creado la cuenta exitosamente. Redirigiendo a la página de inicio de sesión."

	const [showMessage, setShowMessage] = React.useState(false);

	const regexHandler = new RegExp(regExpEmail);

	function handleEmail(event: any) {
		setEmail(event.target.value);
		if(regexHandler.test(event.target.value)) { 
			setShowMessage(true);
		  }else{setShowMessage(false)}
	}
	function handlePassword(event: any) {
		setPassword(event.target.value);
	}

	function timeout(delay: number) {
		return new Promise( res => setTimeout(res, delay) );
	  }
	

	async function SendCredentialsDatabase() {
		return await fetch(
			`http://127.0.0.1:4000/api/sign_up?email=${email}&password=${password}`,
			{ method:"put", headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.catch((e) => {
				console.log("Could not send sign up to database");
			})
			.then((data) => {
				console.log(data);
				return data;
			})
			.finally(() => {
				// window.location.href = "/login";
			});
	}
	const handleClick =() => {
		if(!showMessage) { 
		  setErrorMessage("Por favor ingrese un correo valido");
		  setShowError(true);
		}else{
		  SendCredentialsDatabase()
			.then(async(data) => {
				
				if (data.message === "User created successfully") {
					setShowSuccesful(true);
					await timeout(2000);
					// window.location.href = "/login";
				}else {
					if (data.message === "User already exist") {
						setErrorMessage("Este usuario ya está registrado");
					}else if (data.message === "Failed to sign up: A value is undefined or null"){
						setErrorMessage("Por favor llene todos los campos");
					}else {
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
						<div className="signup-header">Crea un Usuario</div>
						{showError && <div className="login-error">{errorMessage}</div>}
            			{showSuccessful && <div className="login-succesful">{successfulMessage}</div>}
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
