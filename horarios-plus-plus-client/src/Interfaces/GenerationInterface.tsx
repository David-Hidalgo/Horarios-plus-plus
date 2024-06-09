import NavigationBar from "./NavigationBar"
import CourseSemesterContainer from "./CourseSemesterContainer"
import "./GenerationInterface.css"
import React, { type ReactEventHandler } from "react"

import { Schedule, Subject, Section, Session } from "../modules/Schedule.ts"
import ScheduleViewer from "./ScheduleViewer.tsx"

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
}


function ScheduleContainer({ shownShedules }: ScheduleContainerProperties) {
  return (
    <div className="schedule-container">
      <div className="schedule-flex">
        <div className="two-schedules">
          {shownShedules[0] != undefined && <button> <ScheduleViewer loadedSchedule={shownShedules[0]} /> </button>}
          {shownShedules[1] != undefined && <button> <ScheduleViewer loadedSchedule={shownShedules[1]} /> </button>}
        </div>
        <div className="two-schedules">
          {shownShedules[2] != undefined && <button> <ScheduleViewer loadedSchedule={shownShedules[2]} /> </button>}
          {shownShedules[3] != undefined && <button> <ScheduleViewer loadedSchedule={shownShedules[3]} /> </button>}
        </div>
      </div>
    </div>
  )
}

function GenerateButton() {
  async function sendGenerateSignal(event: any) {
    alert("We sent a signal to the server, awaiting response")
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

  const [scheduleIndex, setScheduleIndex] = React.useState<number>(0)

  function assignMissingColors(subjectList: ISubject[]): ISubject[] {
    let colorlist = colors
    return subjectList.map((subject) => {
      let selectedColor = colorlist[Math.floor(Math.random() * colorlist.length)]
      subject.color = selectedColor
      colorlist = colorlist.filter((color) => { return color != selectedColor })
      return subject
    })
  }

  function saveLoadedCoursesToServer() {
    let retSubject = loadedSubjects?.map((subject: ISubject) => {
      return new Subject(subject.name, subject.sectionList.map((section) => {
        return new Section(section.nrc, section.sessionList.map((session) => {
          return new Session(session.start, session.end, session.day)
        }))
      }))
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
          <GenerateButton />
        </div>
        {generatedSchedules != undefined && <div className="schedule-box">
          <div className="action-buttons">
            <button className="filter-button" type="button">filter</button>
          </div>

          <ScheduleContainer shownShedules={generatedSchedules.slice(scheduleIndex, scheduleIndex + 4)} />

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