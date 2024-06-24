const storedData = sessionStorage.getItem('login');
const loggedIn = !(storedData === null)

export default function NavigationBar() {
  return (
    <div className="navbar-container">
      <div><h1><a href="/">HorariosPP</a></h1></div>
      {loggedIn && <>
        <div><a href="/schedule">Mi Horario</a></div>
        <div><a href="/generation">Generar</a></div>
        <div><a href="/time_blocks">Agregar Horario</a></div>
      </>}
      {!loggedIn && <>
          <div className="sign-up"><a href="/login">Iniciar Sesion</a></div>
          <div className="sign-up"><a href="/sign_up">Crear Cuenta</a></div>
        </>
      }
    </div>
  )
}
