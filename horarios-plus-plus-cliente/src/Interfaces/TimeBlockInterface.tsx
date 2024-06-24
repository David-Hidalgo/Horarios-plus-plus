import React, { type MouseEventHandler } from "react"

import CourseSemesterContainer from "./CourseSemesterContainer"
import NavigationBar from "./NavigationBar"
import "./TimeBlockInterface.css"

interface ISession {
  day: number,
  start: Date
  end: Date;
  section: ISection;
}

interface ISection {
  nrc: string
  teacher: string
  subject: ISubject
  sessionList: Array<ISession>
}

interface ISubject {
  name: string;
  sectionList: Array<ISection>;
}

interface EditableSectionContainerProperties {
  selectedSection: ISection
  updateSectionBind: any
  addClassBind: any
  removeClassBind: any
  updateClassBind: any
  saveDataBind: any
}

interface HourSelectorProperties {
  changeBind: any
  dateBind: Date
}

interface CourseProperties {
  displayCourse: ISubject
  newSectionBind: any
  removeSectionBind: any
  selectSectionBind: any
}

interface DaySelectorProperties {
  changeBind: any
  classBind: ISession
}

interface TimeBlockProperties {
  changeBind: any;
  classBind: ISession
}

interface ActionableButton {
  action: MouseEventHandler;
}

function Course({ displayCourse, newSectionBind, removeSectionBind, selectSectionBind }: CourseProperties) {
  function addNewSection() {
    displayCourse = newSectionBind(displayCourse)
  }

  function removeExistingSection(section: ISection) {
    displayCourse = removeSectionBind(displayCourse, section)
  }

  return (
    <div>
      <div className="course">
        <div className="course-name">
          {displayCourse.name}
        </div>
        <div className="add-section">
          <button onClick={addNewSection} type="button">Add Section</button>
        </div>
      </div>
      <div>
        {displayCourse?.sectionList.map((value) => {
          return <div className="section">
            <div>
              <button onClick={() => selectSectionBind(value)}>
                NRC: {value.nrc}
              </button>
            </div>
            <div className="delete-section">
              <button onClick={() => removeExistingSection(value)}> TRASH </button>
            </div>
          </div>;
        })
        }
      </div>
    </div>
  )
}


function HourSelector({ changeBind, dateBind }: HourSelectorProperties) {
  // we use new Date() to avoid changing it HERE by reference
  // Since we want to change it in the changeBind, not here

  const handleHourChange = (event: any) => {
    let toSend = new Date()
    toSend.setHours(event.target.value)
    toSend.setMinutes(dateBind.getMinutes())
    changeBind(toSend)
  }

  const handleMinutesChange = (event: any) => {
    let toSend = new Date()
    toSend.setHours(dateBind.getHours())
    toSend.setMinutes(event.target.value)
    changeBind(toSend)
  }

  return (
    <div className="hour-selection-container">
      <select value={dateBind.getHours()} onChange={handleHourChange}>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
        <option value="13">13</option>
        <option value="14">14</option>
        <option value="15">15</option>
        <option value="16">16</option>
        <option value="17">17</option>
        <option value="18">18</option>
        <option value="19">19</option>
        <option value="20">20</option>
      </select>
      <select value={dateBind.getMinutes()} onChange={handleMinutesChange}>
        <option value="00">00</option>
        <option value="15">15</option>
        <option value="30">30</option>
        <option value="45">45</option>
      </select>
    </div>
  )
}


function DaySelector({ classBind, changeBind }: DaySelectorProperties) {
  const handleDayChange = (event: any) => {
    changeBind(classBind, { ...classBind, day: event.target.value })
  }

  return (
    <select value={classBind.day} onChange={handleDayChange}>
      <option value="1">Monday</option>
      <option value="2">Tuesday</option>
      <option value="3">Wednesday</option>
      <option value="4">Thursday</option>
      <option value="5">Friday</option>
      <option value="6">Saturday</option>
      <option value="7">Sunday</option>
    </select>
  )
}
// hello i have no idea if this workkds vc conmigo :)?
function TimeBlock({ changeBind, classBind }: TimeBlockProperties) {

  function updateStart(start: Date) {
    changeBind(classBind, { ...classBind, start: start })
  }

  function updateEnd(end: Date) {
    changeBind(classBind, { ...classBind, end: end })
  }

  return (
    <li className="timeblock-container">
      <DaySelector changeBind={changeBind} classBind={classBind} />
      <HourSelector changeBind={updateStart} dateBind={classBind.start} />
      <HourSelector changeBind={updateEnd} dateBind={classBind.end} />
    </li>
  )
}


function SaveButton({ action }: ActionableButton) {
  return (
    <div className="save-button">
      <button onClick={action} type="button">Guardar</button>
    </div>
  )
}



function EditableSectionContainer({ selectedSection, updateSectionBind, addClassBind, removeClassBind, updateClassBind, saveDataBind }: EditableSectionContainerProperties) {
  function addNewClass() {
    addClassBind(selectedSection)
  }

  function removeClass(session: ISession) {
    removeClassBind(selectedSection, session)
  }

  function updateClassTime(oldSession: ISession, newSession: ISession) {
    updateClassBind(selectedSection, oldSession, newSession)
  }

  function updateSectionNRC(event: any) {
    let newNRC = event.target.value
    let newSection: ISection = selectedSection
    newSection = {
      ...newSection,
      nrc: newNRC
    }
    updateSectionBind(selectedSection, newSection)
  }

  function updateSectionTeacher(event: any) {
    let newTeacher = event.target.value
    let newSection: ISection = selectedSection
    newSection = {
      ...newSection,
      teacher: newTeacher
    }
    updateSectionBind(selectedSection, newSection)
  }

  return (
    <div className="editable-section-container">
      <div className="editable-section-header">
        <div className="basic-info" >{selectedSection.subject.name}</div>
        <div>NRC: <input value={selectedSection.nrc} onChange={updateSectionNRC} type="text" /></div>
      </div>
      <div className="teacher-container">Teacher: <input value={selectedSection.teacher} onChange={updateSectionTeacher} type="text" /></div>
      <div className="day-container">Dias: <button onClick={() => addNewClass()}>ADD</button></div>
      <div>
        {selectedSection.sessionList.map((value) => {
          return <div className="day-buttons">
            <TimeBlock changeBind={updateClassTime} classBind={value} />
            <div className="delete-day">
              <button onClick={() => removeClass(value)}> TRASH </button>
            </div>
          </div>
        })}
      </div>
      <SaveButton action={saveDataBind} />
    </div>
  )
}

export default function TimeBlockInterface() {
  const [selectedSection, setSelectedSection] = React.useState<ISection | undefined>(undefined);
  const [loadedSubjects, setLoadedSubjects] = React.useState<Array<ISubject>>();

  let updating = false

  // 1- get every nrc and add to array
  // 2- compare n number to the array
  // 3- if num, +1, remove element and again
  // repeat until n not in list

  function findFreeNRC(): Number {
    let newNRC = 1
    let sectionNRC: string[] = []
    loadedSubjects?.map((x) => {
      x.sectionList.map((w) => {
        sectionNRC.push(w.nrc)
        return undefined
      })
      return undefined
    })
    while (true) {
      if (sectionNRC.includes(newNRC.toString())) {
        newNRC += 1;
      } else {
        console.log("Returning NRC " + newNRC)
        return newNRC
      }
    }

  }

  React.useEffect(() => {
    (async () => {
      if (loadedSubjects) { return; }
      setLoadedSubjects(await loadFromServer())
    })()
  })

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
            sectionList: await loadSectionsFromIdList(subject, subject.sections)
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

  async function fetchSessionsFromSection(section: ISection) {
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
          sessionList: await Promise.all(data.map(async (id: string) => await fetchSessionFromId(id, section)))

        }
        setSelectedSection(newSection)
      })
  }

  function changeSelectedSection(section: ISection) {
    fetchSessionsFromSection(section)
  }

  async function saveSectionToSubject(subject: ISubject, section: ISection) {
    updating = true
    if (subject === undefined || section === undefined) { updating = false; return }
    return await fetch(`http://127.0.0.1:4000/api/section/add_section_to_subject?nrc=${section.nrc}&teacher=${section.teacher}&subjectName=${subject.name}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => { console.error("No se pudo agregar a la base de datos") })
      .then(data => {
        if (data === undefined) { return }
        setLoadedSubjects(
          loadedSubjects?.map(x => {
            if (x !== subject) return x;
            return { ...x, sectionList: x.sectionList.concat([section]) }
          })
        )
      }).finally(() => {
        updating = false
      })
  }

  // Adds new section to a specified course
  function addSectionToCourse(subject: ISubject) {
    if (updating === true) { return }
    let createdSection: ISection = { subject: subject, nrc: findFreeNRC().toString(), sessionList: [], teacher: "Por anunciar" }
    saveSectionToSubject(subject, createdSection)
  }

  async function deleteSectionFromDatabase(section: ISection) {
    await await fetch(`http://127.0.0.1:4000/api/section/delete_section?nrc=${section.nrc}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => {
        console.error("ERROR while trying to remove section ", section)
        console.error(e)
      })
  }

  function removeSectionFromCourse(course: ISubject, section: ISection): ISubject {
    let ret: ISubject = course
    setLoadedSubjects(
      loadedSubjects?.map((x) => {
        if (x !== course) return x;
        ret = {
          ...x,
          sectionList: x.sectionList.filter((y) => y !== section)
        }
        return ret
      })
    )

    deleteSectionFromDatabase(section)

    if (section === selectedSection) { setSelectedSection(undefined); }
    return ret
  }

  async function updateSectionServer(oldSection: ISection, newSection: ISection) {
    updating = true

    let allow_change = true
    return await fetch(`http://127.0.0.1:4000/api/section/update_section?oldnrc=${oldSection.nrc}&nrc=${newSection.nrc}&teacher=${newSection.teacher}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch((e) => {
        console.error("Error actualizando base de datos ", e)
        allow_change = false
      })
      .then(data => { console.log(data) })
      .finally(() => {
        let newValue = allow_change ? newSection : oldSection
        setSelectedSection(newValue)
        setLoadedSubjects(
          loadedSubjects?.map((x) => {
            if (!x.sectionList.includes(oldSection)) return x;
            x.sectionList[x.sectionList.indexOf(oldSection)] = newValue
            return x
          })
        )
        updating = false
      })
  }

  function updateSectionFromCourse(oldSection: ISection, newSection: ISection) {
    if (updating) { return; }
    updateSectionServer(oldSection, newSection)
  }

  async function deleteSessionFromSection(session: ISession, section: ISection) {
    let saved = true;
    await fetch(
      `http://127.0.0.1:4000/api/session/delete_session?nrc=${section.nrc
      }&day=${session.day}&start=${session.start.getTime()}&end=${session.end.getTime()}`,
      { headers: { Accept: "application/json" } }
    )
      .then((response) => response.json())
      .catch((e) => {
        saved = false;
        console.error("ERROR unable to delete session from section ", e);
      })
      .finally(() => {
        if (saved) { changeSelectedSection(section) }
      })

  }

  async function saveNewSessionToSection(session: ISession, section: ISection) {
    let saved = true
    await fetch(`http://127.0.0.1:4000/api/session/add_session_to_section?day=${session.day}&start=${session.start.getTime()}&end=${session.end.getTime()}&nrc=${section.nrc}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => {
        saved = false
        console.error("ERROR unable to create section ", e)
      })
      .then(data => {
        if (saved) {
          changeSelectedSection(section)
        }
      })
  }

  function addClassToSection(section: ISection): ISection {
    function ReturnDate(hours: number, minutes: number): Date {
      let ret = new Date(0)
      ret.setHours(hours)
      ret.setMinutes(minutes)
      return ret
    }

    let newSession: ISession = { day: 1, end: ReturnDate(6, 15), start: ReturnDate(6, 0), section: section }
    section.sessionList.push(newSession)

    if (section.sessionList.includes(newSession)) {
      saveNewSessionToSection(newSession, section)
    }
    return section
  }

  function removeClassFromSection(section: ISection, session: ISession): ISection {
    section.sessionList = section.sessionList.filter(y => y !== session)
    deleteSessionFromSection(session, section)
    return section
  }

  async function updateClassFromServer(oldSession: ISession, newSession: ISession, section: ISection) {
    let variables = `oldday=${oldSession.day}&` +
      `oldstart=${oldSession.start.getTime()}&` +
      `oldend=${oldSession.end.getTime()}&` +
      `newday=${newSession.day}&` +
      `newstart=${newSession.start.getTime()}&` +
      `newend=${newSession.end.getTime()}&` +
      `nrc=${section.nrc}`

    let changed = true
    await fetch(`http://127.0.0.1:4000/api/session/updateSession?${variables}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => {
        changed = false
        console.error("ERROR updating session ", e)
      })
      .finally(() => {
        changeSelectedSection(section)
      })
  }

  function updateClassFromSection(section: ISection, oldSession: ISession, newSession: ISession): ISection {
    if (newSession.start.getHours() * 60 + newSession.start.getMinutes() >= newSession.end.getHours() * 60 + newSession.end.getMinutes()){ return section; }
    if (oldSession !== newSession) {
      let newSection: ISection = section
      newSection.sessionList[newSection.sessionList.indexOf(oldSession)] = newSession
      updateClassFromServer(oldSession, newSession, newSection)
    }
    return section
  }

  return (
    <div>
      <NavigationBar />
      <div className="main-container">
        <div className="course-box-container">
          <CourseSemesterContainer />
          <div>
            {loadedSubjects?.map((value) => {
              return <Course displayCourse={value} newSectionBind={addSectionToCourse} removeSectionBind={removeSectionFromCourse} selectSectionBind={changeSelectedSection} />
            })}
          </div>
        </div>
        <div className="section-edit-container">
          {selectedSection !== undefined && <EditableSectionContainer selectedSection={selectedSection} updateSectionBind={updateSectionFromCourse} addClassBind={addClassToSection} removeClassBind={removeClassFromSection} updateClassBind={updateClassFromSection} saveDataBind={() => console.log("Peanis")} />}
        </div>
      </div>
    </div>
  )
}