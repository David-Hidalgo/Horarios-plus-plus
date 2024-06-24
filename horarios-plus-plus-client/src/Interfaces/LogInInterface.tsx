import NavigationBar from "./NavigationBar";
import "./LogInInterface.css";
import React, { useState } from "react";
import { regExpEmail } from  "./helpers.tsx";

export default function LogInInterface() {
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

  const [showSuccessful, setShowSuccesful] = useState(false);
  const successfulMessage = "Ha iniciado sesión correctamente"

  const [email, setEmail] = React.useState()
  const [password, setPassword] = React.useState()

  const [showMessage, setShowMessage] = useState(false);

const regexHandler = new RegExp(regExpEmail);
 

  function handleEmail(event: any) { 
    setEmail(event.target.value)
    if(regexHandler.test(event.target.value)) { 
      setShowMessage(true);
    }else{setShowMessage(false)}
  }
  function handlePassword(event: any) { setPassword(event.target.value) }

  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
  }

  async function SendLoginDatabase() {
    return await fetch(`http://localhost:4000/api/login?email=${email}&password=${password}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch((e) => { console.log("Could not send login to database") })
      .then(data => {
        console.log(data);
        
        if (data.message === "successful") {
          sessionStorage.setItem('login', `${email}`);
        }
        console.log(data)
        return data;
      })
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
				<div className="login-container">
					<div className="login-bg">
						<div className="login-header">Inicio de Sesion</div>
						{showError && <div className="login-error">{errorMessage}</div>}
            {showSuccessful && <div className="login-succesful">{successfulMessage}</div>}
						<div className="login-user">
							<input
								value={email}
								onChange={handleEmail}
								placeholder="Email"
								type="text"
							/>
						</div>
						<div className="login-password">
							<input
								value={password}
								onChange={handlePassword}
								placeholder="Contraseña"
								type="text"
							/>
						</div>
						<div className="login-button">
							<button type="button" onClick={handleClick}>
								Iniciar Sesion
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
