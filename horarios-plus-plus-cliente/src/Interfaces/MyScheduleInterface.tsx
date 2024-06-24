import React from "react"
import { useState } from "react"

import NavigationBar from "./NavigationBar"
import "./MyScheduleInterface.css"

import { type ISchedule, type ISection, type ISubject } from "./ScheduleViewer.tsx"
import ScheduleViewer from "./ScheduleViewer.tsx"

const email = sessionStorage.getItem("login");


export default function MySheduleInterface() {
  const [loadedSchedule, setLoadedSchedule] = React.useState()

  async function fetchSessionFromId(id: string, section: ISection): Promise<ISession> {
    return await fetch(`http://127.0.0.1:4000/api/session/get_sessions_from_id?id=${id}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => { console.error(e) })
      .then(data => {
        console.log(data)
        let newSession: ISession = {
          day: data.day,
          start: new Date(data.start),
          end: new Date(data.end),
          section: section,
        }
        return newSession
      })
  }

  async function fetchSubjectFromId(id: string, section: ISection): Promise<ISubject> {
    return await fetch(`http://127.0.0.1:4000/api/subjects/get_subjects_from_id?id=${id}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .then(data => {
        let newSubject: ISubject = {
          color: undefined,
          name: data.name,
        }
        return newSubject
      })
  }

  async function loadSectionFromID(id: string): Promise<ISection> {
    let fetched = true
    let section: ISection = await fetch(`http://127.0.0.1:4000/api/section/get_sections_from_id?id=${id}`,
      { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .catch(e => {
        fetched = false
        console.error("ERROR Loading section ", e)
      })
      .then(async data => {
        let newSection: ISection = {
          nrc: data.nrc,
          teacher: data.teacher,
        }
        newSection.subject = await fetchSubjectFromId(data.subject, newSection)
        newSection.sessionList = await Promise.all(data.sessions.map(async (id: string) => {
          return await fetchSessionFromId(id, newSection)
        }))
        return newSection
      })
    return section
  }

  async function getSchedule() {
    let fetched = true
    return await fetch(`http://127.0.0.1:4000/api/schedule/get_schedule_from_owner?owner=${email}`,
      { headers: { 'Accept': 'application/json' } })
      .then((response) => response.json())
      .catch(e => {
        fetched = false
        console.error("ERROR loading user schedule ", e)
      })
      .then(async data => {
        if (!fetched) { return { sectionList: [] } }
        console.log(data)
        let newSchedule: ISchedule = {
          sectionList: await Promise.all(data.sections.map(async (id: string) => {
            return await loadSectionFromID(id)
          }))
        }
        console.log(newSchedule)
        return newSchedule
      })
  }

  React.useEffect(() => {
    (async () => {
      if (loadedSchedule) { return; }
      setLoadedSchedule(await getSchedule())
    })()
  })

  return (
    <div>
      <NavigationBar />
      <div className="main-container">
        {loadedSchedule !== undefined && <ScheduleViewer loadedSchedule={loadedSchedule} />}
      </div>
    </div>
  );
}