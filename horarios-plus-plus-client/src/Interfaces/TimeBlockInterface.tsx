import React, { type MouseEventHandler } from "react"

import { Schedule, Subject, Section, Session } from "../modules/Schedule.ts"

import "./TimeBlockInterface.css"
import NavigationBar from "./NavigationBar"
import CourseSemesterContainer from "./CourseSemesterContainer"
import { setSelectionRange } from "@testing-library/user-event/dist/utils"

export interface ISession {
  day: number,
  start: Date
  end: Date;
  section: ISection;
}

export interface ISection {
  nrc: string
  teacher: string
  course: ISubject
  classesList: Array<ISession>
}

export interface ISubject {
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
    changeBind(classBind, {...classBind, day: event.target.value })
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

function TimeBlock({ changeBind, classBind }: TimeBlockProperties) {

  function updateStart(start: Date) {
    changeBind(classBind, {...classBind, start: start})
  }
  
  function updateEnd(end: Date) {
    changeBind(classBind, {...classBind, end: end})
  }

  return (
    <li className="timeblock-container">
      <DaySelector changeBind={changeBind} classBind={classBind} />
      <HourSelector changeBind={updateStart} dateBind={classBind.start}/>
      <HourSelector changeBind={updateEnd} dateBind={classBind.end}/>
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



function EditableSectionContainer({ selectedSection, updateSectionBind, addClassBind, removeClassBind, updateClassBind, saveDataBind}: EditableSectionContainerProperties) {
  function addNewClass() {
    addClassBind(selectedSection)
  }

  function removeClass(session: ISession) {
    removeClassBind(selectedSection, session)
  }

  function updateClassTime(session: ISession, newClass: ISession) {
    updateClassBind(selectedSection, session, newClass)
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

  function debugPrintHour(session: ISession) {
    alert(
      "day: " + session.day +
      "\n" + "start: " + session.start.getHours() + ":" + session.start.getMinutes() +
      "\n" + "end: " + session.end.getHours() + ":" + session.end.getMinutes()
    )
  }

  

  return (
    <div className="editable-section-container">
      <div className="editable-section-header">
        <div className="basic-info" >{selectedSection.course.name}</div>
        <div>NRC: <input value={selectedSection.nrc} onChange={updateSectionNRC} type="text" /></div>
      </div>
      <div className="teacher-container">Teacher: <input value={selectedSection.teacher} onChange={updateSectionTeacher} type="text" /></div>
      <div className="day-container">Dias: <button onClick={() => addNewClass()}>ADD</button></div>
      <div>
        {selectedSection.classesList.map((value) => {
          return <div className="day-buttons">
            <TimeBlock changeBind={updateClassTime} classBind={value}/>
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

const testingCourse: ISubject = {
  name: "Matematica Basica",
  sectionList: []
}

const testCourse2: ISubject = {
  name: "Calculo I",
  sectionList: []
}

const testCourse3: ISubject = {
  name: "porgmaram I",
  sectionList: []
}
async function fetchClasses(): Promise<Array<ISubject>> {
  try {
    const response = await fetch('http://localhost:4000/getClasses');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}


// Call the fetchClasses function and assign the result to loadedSubjects
export default function TimeBlockInterface() {
  const [selectedSection, setSelectedSection] = React.useState<ISection | undefined>(undefined);
  const [loadedSubjects, setLoadedSubjects] = React.useState<Array<ISubject>>([]);

  React.useEffect(() => {
    fetchClasses().then(data => setLoadedSubjects(data));
  }, []);


  function saveLoadedCoursesToServer() {
    let retSubject = loadedSubjects.map((subject: ISubject) => {
      return new Subject(subject.name, subject.sectionList.map((section) => {
        return new Section(section.nrc, section.classesList.map((session) =>{
          return new Session(session.start, session.end, session.day)
        }))
      }))
    })
  }

  function changeSelectedSection(section: ISection) {
    setSelectedSection(section)
  }

  // Adds new section to a specified course
  function addSectionToCourse(course: ISubject): ISubject {

    function findFreeNrc(list: ISection[]): string {
      let max = 0;
      list.forEach(x => {
        let x_int = parseInt(x.nrc)
        if (x_int >= max) { max = x_int + 1; }
      });
      return max.toString();
    }

    let ret: ISubject = course
    setLoadedSubjects(
      loadedSubjects.map(x => {
        if (x !== course) return x;
        ret = {
          ...x,
          sectionList: x.sectionList.concat([{ course: course, nrc: findFreeNrc(x.sectionList), classesList: [], teacher: "" }])
        }
        return ret
      })
    )
    return ret
  }

  function removeSectionFromCourse(course: ISubject, section: ISection): ISubject {
    let ret: ISubject = course
    setLoadedSubjects(
      loadedSubjects.map((x) => {
        if (x !== course) return x;
        ret = {
          ...x,
          sectionList: x.sectionList.filter((y) => y !== section)
        }
        return ret
      })
    )
    if (section === selectedSection) { setSelectedSection(undefined); }
    return ret
  }

  function updateSectionFromCourse(section: ISection, newSection: ISection): ISection | undefined {
    let ret: ISection | undefined = undefined
    let nrcChanged : boolean = (section.nrc != newSection.nrc)

    setLoadedSubjects(
      loadedSubjects.map((x) => {
        if (!x.sectionList.includes(section)) return x;

        if (nrcChanged && x.sectionList.some(y => y.nrc == newSection.nrc)) {
          alert("Dos secciones de la misma materia no pueden tener el mismo NRC")
          ret = section
          return x
        }

        ret = newSection
        x.sectionList[x.sectionList.indexOf(section)] = ret
        return x
      })
    )

    setSelectedSection(ret)
    return ret
  }

  function addClassToSection(section: ISection): ISection {
    function ReturnDate(hours: number, minutes: number): Date {
      let ret = new Date()
      ret.setHours(hours)
      ret.setMinutes(minutes)
      return ret
    }

    setLoadedSubjects(
      loadedSubjects.map((x) => {
        if (!x.sectionList.includes(section)) return x;
        section.classesList.push({ day: 0, end: ReturnDate(6, 15), start: ReturnDate(6, 0), section: section })
        return x;
      })
    )

    setSelectedSection(section)
    return section
  }

  function removeClassFromSection(section: ISection, session: ISession): ISection {
    setLoadedSubjects(
      loadedSubjects.map((x) => {
        if (!x.sectionList.includes(section)) return x;
        section.classesList = section.classesList.filter(y => y !== session)
        return x;
      })
    )
    setSelectedSection(section)
    return section
  }

  function updateClassFromSection(section: ISection, session: ISession, newClass: ISession): ISection {
    setLoadedSubjects(
      loadedSubjects.map((x) => {
        if (!x.sectionList.includes(section)) return x;

        if (newClass.start.getHours() * 60 + newClass.start.getMinutes() >= newClass.end.getHours() * 60 + newClass.end.getMinutes()) {
          alert("La hora final de una clase no puede estar detras, o ser igual, a la hora final de la clase")
          return x
        }

        section.classesList[section.classesList.indexOf(session)] = newClass
        return x
      })
    )
    setSelectedSection(section)
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
          {selectedSection != undefined && <EditableSectionContainer selectedSection={selectedSection} updateSectionBind={updateSectionFromCourse} addClassBind={addClassToSection} removeClassBind={removeClassFromSection} updateClassBind={updateClassFromSection} saveDataBind={saveLoadedCoursesToServer}/>}
        </div>
      </div>
    </div>
  )
}