import React from "react"
//MARK: Criss puedo importar la librería que pasé para la notificación de el error en la  contraseña?
import NavigationBar from "./NavigationBar"
import CourseSemesterContainer from "./CourseSemesterContainer"
import "./GenerationInterface.css"
import ScheduleViewer from "./ScheduleViewer.tsx"

const email = sessionStorage.getItem("login")

const colors = [
  "#484349", "#431E82", "#792359", "#92233B",
  "#D7263D", "#A83E28", "#772E25", "#8F5800",
  "#1C7C54", "#386154", "#4E6766", "#2C666E",
  "#1672A3", "#0A498D", "#1D1D79", "#89355B"
]

interface ISession {
  section: ISection
  day: number
  start: Date
  end: Date
}

interface ISection {
  nrc: string
  teacher: string
  sessionList: ISession[]
  subject: ISubject
  enabled: boolean
}

interface ISchedule {
  sectionList: ISection[]
}

interface ISubject {
  sectionList: ISection[]
  color: string | undefined
  name: string
  enabled: boolean
}

interface CourseProperties {
  displayCourse: ISubject
  updateSectionBind: any
  updateCourseBind: any
}

interface ScheduleContainerProperties {
  shownShedules: ISchedule[]
  saveScheduleBind: any
}


function ScheduleContainer({ shownShedules, saveScheduleBind }: ScheduleContainerProperties) {
  return (
    <div className="schedule-container">
      <div className="schedule-flex">
        <div className="two-schedules">
          {shownShedules[0] !== undefined && <button onClick={() => saveScheduleBind(shownShedules[0])}> <ScheduleViewer loadedSchedule={shownShedules[0]} /> </button>}
          {shownShedules[1] !== undefined && <button onClick={() => saveScheduleBind(shownShedules[1])}> <ScheduleViewer loadedSchedule={shownShedules[1]} /> </button>}
        </div>
        <div className="two-schedules">
          {shownShedules[2] !== undefined && <button onClick={() => saveScheduleBind(shownShedules[2])}> <ScheduleViewer loadedSchedule={shownShedules[0]} /> </button>}
          {shownShedules[3] !== undefined && <button onClick={() => saveScheduleBind(shownShedules[3])}> <ScheduleViewer loadedSchedule={shownShedules[1]} /> </button>}
        </div>
      </div>
    </div>
  )
}

interface GenerateButtonProperties {
  generationBind: any
}

function GenerateButton({ generationBind }: GenerateButtonProperties) {
  function sendGenerateSignal() {
    generationBind()
  }

  return (
    <div className="generate-button-container">
      <button onClick={sendGenerateSignal}> GENERAR </button>
    </div>
  )
}


function Course({ displayCourse, updateSectionBind, updateCourseBind }: CourseProperties) {

  function updateSectionEnabled(section: ISection) {
    updateSectionBind(section, { ...section, enabled: !section.enabled })
  }
  function updateCourseEnabled() {
    updateCourseBind(displayCourse, { ...displayCourse, enabled: !displayCourse.enabled })
  }

  return (
    <div>
      <div className="course">
        <div className="course-name">
          {displayCourse.name}
        </div>
        <div className="add-section">
          <input onChange={updateCourseEnabled} type="checkbox" />
        </div>
      </div>
      <div>
        {displayCourse.sectionList.map((section) => {
          return <div className="section">
            <div> NRC: {section.nrc} </div>
            <div className="delete-section">
              <input onChange={() => updateSectionEnabled(section)} disabled={!displayCourse.enabled} checked={displayCourse.enabled && section.enabled} type="checkbox" />
            </div>
          </div>;
        })
        }
      </div>
    </div>
  )
}

export default function GenerationInterface() {
  const [loadedSubjects, setLoadedSubjects] = React.useState<ISubject[]>();
  const [generatedSchedules, setGeneratedSchedules] = React.useState<ISchedule[]>()
  

  React.useEffect(() => { (async () => {
    if (loadedSubjects !== undefined) { return; }
    setLoadedSubjects(await loadFromServer())
  })() })

  const [scheduleIndex, setScheduleIndex] = React.useState<number>(0)

  function assignMissingColors(subjectList: ISubject[]): ISubject[] {
    let colorlist = colors
    return subjectList.map((subject) => {
      let selectedColor = colorlist[Math.floor(Math.random() * colorlist.length)]
      subject.color = selectedColor
      colorlist = colorlist.filter((color) => { return color !== selectedColor })
      return subject
    })
  }

  function updateCourse(subject: ISubject, newSubject: ISubject) {
    setLoadedSubjects(
      loadedSubjects?.map((x) => {
        if (x !== subject) { return x }
        return newSubject
      })
    )
  }

  function updateSectionFromCourse(section: ISection, newSection: ISection) {
    setLoadedSubjects(
      loadedSubjects?.map((x) => {
        if (!x.sectionList.includes(section)) return x;
        x.sectionList[x.sectionList.indexOf(section)] = newSection
        return x
      })
    )
  }

  React.useEffect(() => { (async () => {  })() })

  async function loadSectionFromID(subject: ISubject, id: string): Promise<ISection> {
    let section: ISection = await fetch(`http://127.0.0.1:4000/api/section/get_sections_from_id?id=${id}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .then(data => {
        let newSection: ISection = {
          nrc: data.nrc,
          teacher: data.teacher,
          sessionList: [],
          subject: subject,
          enabled: false,
        }
        return newSection
      })
    return section
  }

  async function loadSectionsFromIdList(subject: ISubject, Ids: string[]) {
    if (Ids === undefined || Ids.length === 0) { return []; }
    let promises = Ids.map(async (id) => { return loadSectionFromID(subject, id) })
    return Promise.all(promises)
  }

  async function loadFromServer(): Promise<ISubject[]> {
    let subjects: Promise<ISubject>[] = await fetch("http://127.0.0.1:4000/api/subjects/get_subjects", {
      headers: { 'Accept': 'application/json' }
    })
      .then(response => response.json())
      .then((data: any[]) => {
        return data.map(async (subject) => {
          let newSubject: ISubject = {
            name: subject.name,
            sectionList: await loadSectionsFromIdList(subject, subject.sections),
            enabled: false,
            color: undefined
          }
          console.log(newSubject)
          return newSubject
        })
      })
    return Promise.all(subjects)
  }

  async function fetchSessionFromId(id: string, section: ISection): Promise<ISession> {
    return await fetch(`http://127.0.0.1:4000/api/session/get_sessions_from_id?id=${id}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => { console.error(e) })
      .then(data => {
        let newSession: ISession = {
          day: data.day,
          start: new Date(data.start),
          end: new Date(data.end),
          section: section,
        }
        return newSession
      })
  }

  async function fetchSessionsFromSection(section: ISection): Promise<ISection> {
    return await fetch(`http://127.0.0.1:4000/api/session/get_sessions_from_section?nrc=${section.nrc}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => { console.error("No se pudo obtener las sessiones de la seccion") })
      .then(async data => {
        if (data === undefined) { return }
        let newSection: ISection = {
          nrc: section.nrc,
          teacher: section.teacher,
          subject: section.subject,
          sessionList: await Promise.all(data.map(async (id: string) => await fetchSessionFromId(id, section))),
          enabled: true,
        }
        return newSection
      })
  }

  async function fetchSubjectFromId(id: string, section: ISection): Promise<ISubject> {
    return await fetch(`http://127.0.0.1:4000/api/subjects/get_subjects_from_id?id=${id}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .then(data => {
        let newSubject: ISubject = {
          color: undefined,
          enabled: true,
          name: data.name,
          sectionList: [section]
        }
        return newSubject
      })
  }

  async function getSchedulesFromServer() {
    let sections: ISection[] = []
    loadedSubjects?.forEach((subject) => {
      if (!subject.enabled) { return; }
      sections = sections.concat(subject.sectionList.filter(section => section.enabled))
    })

    if (sections.length === 0) { return undefined; }
    sections = sections.map(section => section.nrc)
    let nrcString: string = sections.join(",")

    let owner = email
    await fetch(`http://127.0.0.1:4000/api/schedules/generate_schedules?owner=${owner}&nrcs=${nrcString}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .then(async data => {
        let scheduleList: ISchedule[] = []
        scheduleList = await Promise.all(data.map(async (schedule) => {
          let newSchedule: ISchedule = {
            sectionList: await Promise.all(schedule.map(async (section) => {
              let newSection: ISection = {
                nrc: section.nrc,
                teacher: section.teacher,
                enabled: true,
              }
              newSection.subject = await fetchSubjectFromId(section.subject, section)
              newSection = await fetchSessionsFromSection(newSection)
              return newSection
            }))
          }
          return newSchedule
        }))
        setGeneratedSchedules(scheduleList)
      })
  }

  async function saveScheduleToServer(schedule: ISchedule) {
    let nrcs = schedule.sectionList.map(section => section.nrc).join(',')
    await fetch(`http://127.0.0.1:4000/api/schedules/save_schedule?owner=${email}&nrcs=${nrcs}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response)
      .catch(e => { console.error("ERROR SAVING schedule ", e)})
  }

  function generateSchedules() {
    getSchedulesFromServer()
  }

  return (
    <div>
      <NavigationBar />
      <div className="main-container">
        <div className="course-box">
          <CourseSemesterContainer />
          <div>
            {loadedSubjects?.map((value) => {
              return <Course displayCourse={value} updateSectionBind={updateSectionFromCourse} updateCourseBind={updateCourse} />
            })}
          </div>
          <GenerateButton generationBind={generateSchedules}/>
        </div>
        {generatedSchedules !== undefined && <div className="schedule-box">
          <div className="action-buttons">
            <button className="filter-button" type="button">filter</button>
          </div>

          <ScheduleContainer saveScheduleBind={saveScheduleToServer} shownShedules={generatedSchedules.slice(scheduleIndex, scheduleIndex + 4)} />

          <div className="nav-buttons">
            <div className="ll-button">
              <button onClick={() => setScheduleIndex(0)} type="button">&lt;&lt;</button>
            </div>
            <div className="l-button">
              <button onClick={() => setScheduleIndex(Math.max(0, scheduleIndex - 4))} type="button">&lt;</button>
            </div>
            <div className="m-button">
              <button type="button">Guardar</button>
            </div>
            <div className="r-button">
              <button onClick={() => setScheduleIndex(Math.min(Math.floor(generatedSchedules.length / 4) * 4, scheduleIndex + 4))} type="button">&gt;</button>
            </div>
            <div className="rr-button">
              <button onClick={() => setScheduleIndex(Math.floor(generatedSchedules.length / 4) * 4)} type="button">&gt;&gt;</button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  )
}