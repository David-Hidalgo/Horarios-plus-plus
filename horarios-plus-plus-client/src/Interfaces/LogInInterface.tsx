import NavigationBar from "./NavigationBar"
import "./LogInInterface.css"
import React, { useState } from "react";

export default function LogInInterface() {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [email, setEmail] = React.useState()
  const [password, setPassword] = React.useState()

  function handleEmail(event: any) { setEmail(event.target.value) }
  function handlePassword(event: any) { setPassword(event.target.value) }

  async function SendLoginDatabase() {
    return await fetch(`http://localhost:4000/api/login?email=${email}&password=${password}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch((e) => { console.log("Could not send login to database") })
      .then(data => {
        if (data.message === "successful") {
          sessionStorage.setItem('login', `${email}`);
        }
        console.log(data)
        return data;
      })
  }

  const handleClick = () => {
    SendLoginDatabase()
      .then((data) => {
        if (data.message === "successful") {
          setShowError(false);
          window.location.href = "/";
        } else {

          setShowError(true);
          if (data.message === "User doesn't exist") {
            setErrorMessage("Usuario no encontrado");
          } else if (data.message === "password doesn't match") {
            setErrorMessage("Contraseña incorrecta");
          } else {
            setErrorMessage("Error desconocido");
          }
        }
      })
      .catch(() => {
        setShowError(true);
      });
  };

  return (
    <div>
      <NavigationBar />
      <div className="main-container">
        <div className="login-container">
          <div className="login-bg">
            <div className="login-header">Horarios Plus Plus</div>
            {showError && <div className="login-error">{errorMessage}</div>}
            <div className="login-user">
              <input value={email} onChange={handleEmail} placeholder="Email" type="text" />
            </div>
            <div className="login-password">
              <input value={password} onChange={handlePassword} placeholder="Contraseña" type="text" />
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