const storedData = sessionStorage.getItem("login");
const loggedIn = !(storedData === null);

export default function NavigationBar() {
	return (
		<div className="navbar-container">
			<div>
				<a href="/">
					<h1>Horarios++</h1>
				</a>
			</div>
			{loggedIn && (
				<>
					<div>
						<a href="/schedule">Horario Generado</a>
					</div>
					<div>
						<a href="/generation">Generar Horario Nuevo</a>
					</div>
					<div>
						<a href="/time_blocks">Agregar Horario</a>
					</div>
				</>
			)}
			{!loggedIn && (
				<>
					<div className="space"></div>
					<div className="sign-up">
						<a href="/login">Iniciar Sesion</a>
					</div>
					<div className="sign-up">
						<a href="/sign_up">Crear Cuenta</a>
					</div>
				</>
			)}
		</div>
	);
}
