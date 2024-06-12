import NavigationBar from "./NavigationBar";
import "./LandingInterface.css";

// TODO: Cambiar tagline
function Description() {
	return (
		<div className="description-container">
			<h1>Horarios</h1>
			<h1>PlusPlus</h1>
			<p>Planea, Genera, Controla y Visualiza tu Horario Universitario.</p>
		</div>
	);
}

interface DeveloperBoxContent {
	name: string;
	github_link: string;
	contact_link?: string;
}

function DeveloperBox({ name, github_link }: DeveloperBoxContent) {
	return (
		<>
			<div className="developer-box">
				<h2>{name}</h2>
				<a href={github_link}>github</a>
			</div>
		</>
	);
}

function Developers() {
	return (
		<>
			<div className="developer-box-title">
				<h1>Desarrollado por:</h1>
			</div>
			<div className="developers-container">
				<DeveloperBox
					name="Daniel Castellanos"
					github_link="https://github.com/David-Hidalgo"
				/>
				<DeveloperBox
					name="David Hidalgo"
					github_link="https://github.com/DanCas03"
				/>
			</div>
		</>
	);
}

export default function LandingInterface() {
	return (
		<div>
			<NavigationBar />
			<div className="screen-container">
				<Description />
				<Developers />
			</div>
		</div>
	);
}
