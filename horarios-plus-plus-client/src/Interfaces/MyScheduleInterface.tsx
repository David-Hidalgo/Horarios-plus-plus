import React from "react"

import NavigationBar from "./NavigationBar"
import "./MyScheduleInterface.css"

import { Schedule, Subject, Section, Session } from "../modules/Schedule.ts"
import ScheduleViewer from "./ScheduleViewer.tsx"

export default function MySheduleInterface() {
  const [loadedSchedule, setLoadedSchedule] = React.useState()

  return (
    <div>
      <NavigationBar />
      <div className="main-container">
        {loadedSchedule != undefined && <ScheduleViewer loadedSchedule={loadedSchedule} /> }
      </div>
    </div>
  )
}