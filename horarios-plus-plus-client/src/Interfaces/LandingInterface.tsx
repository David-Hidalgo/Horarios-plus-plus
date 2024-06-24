import NavigationBar from "./NavigationBar";
import "./LandingInterface.css";

// TODO: Cambiar tagline
function Description() {
  return (
    <div className="description-container">
      <h1>Horarios</h1>
      <h1>PlusPlus</h1>
      <p>Planea, Genera, Controla y Visualiza  tu Horario Universitario.</p>
    </div>
  )
}

interface DeveloperBoxContent {
  name: string;
  description: string;
  github_link: string;
}

function DeveloperBox({ name, description, github_link } : DeveloperBoxContent) {
  return (
    <div className="developer-box">
      <h2>{name}</h2>
      <p>{description}</p>
      <a href={github_link}>github</a>
    </div>
  )
}

function Developers() {
  return (
    <div className="developers-container">
      <DeveloperBox name="Humberto Aleman" description="NONE" github_link="https://github.com/HumbertoAlemanOdreman"/>
      <DeveloperBox name="Cristina Carnevali" description="NONE" github_link="https://github.com/crisUni"/>
      <DeveloperBox name="Daniel Castellanos" description="NONE" github_link="https://github.com/David-Hidalgo"/>
      <DeveloperBox name="David Hidalgo" description="NONE" github_link="https://github.com/DanCas03"/>
    </div>
  )
}

export default function LandingInterface() {
  return (
    <div>
      <NavigationBar/>
      <div className="screen-container">
        <Description/>
        <Developers/>
      </div>
    </div>
  )
}
