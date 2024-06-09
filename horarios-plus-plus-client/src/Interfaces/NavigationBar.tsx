export default function NavigationBar() {
  return (
    <div className="navbar-container">
      <div><h1><a href="/">HorariosPP</a></h1></div>
      <div><a href="/schedule">Mi Horario</a></div>
      <div><a href="/generation">Generar</a></div>
      <div><a href="/time_blocks">Agregar Horario</a></div>
    </div>
  )
}