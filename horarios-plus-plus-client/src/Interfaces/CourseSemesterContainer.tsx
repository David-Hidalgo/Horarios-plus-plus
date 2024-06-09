import React from 'react'
import "./CourseSemesterContainer.css"

export default function CourseSemesterContainer() {
  const [selectedCareer, setSelectedCareer] = React.useState("ingenieria_informatica") // Valor default
  const [selectedSemester, setSelectedSemester] = React.useState("20240205") // Valor default

  function handleCareerChange(event : any) {
    setSelectedCareer(event.target.value)
    // TODO: Add function that uses selectedSemester and event.target.value to fetch horarios
  }

  const handleSemesterChange = (event : any) => {
    setSelectedSemester(event.target.value)
    // TODO: Add function that uses selectedCareer and event.target.value to fetch horarios
  }

  return (
    <div>
      <div className="career-dropdown-container">
        <select value={selectedCareer} onChange={handleCareerChange}>
          <option value="ingenieria_informatica">Ingenieria Informatica</option>
          <option value="theology">Teologia</option>
        </select> 
      </div>
    </div>
  )
}