import React from "react";
//MARK: Criss puedo importar la librería que pasé para la notificación de el error en la  contraseña?
import NavigationBar from "./NavigationBar";
import CourseSemesterContainer from "./CourseSemesterContainer";
import "./GenerationInterface.css";
import ScheduleViewer from "./ScheduleViewer.tsx";
import { Subject, type Schedule, type Section } from "../../../horarios-plus-plus-server-new/src/models/classes.ts";

const email = sessionStorage.getItem("login");

const colors = [
  "#484349",
  "#431E82",
  "#792359",
  "#92233B",
  "#D7263D",
  "#A83E28",
  "#772E25",
  "#8F5800",
  "#1C7C54",
  "#386154",
  "#4E6766",
  "#2C666E",
  "#1672A3",
  "#0A498D",
  "#1D1D79",
  "#89355B",
];

interface ISession {
	day: number;
	start: Date;
	end: Date;
  section: ISection;
}

interface ISection {
  nrc: string;
  teacher: string;
  sessionList: ISession[];
  subject: ISubject;
  enabled: boolean;
}

interface ISchedule {
  sectionList: ISection[];
}

interface ISubject {
  sectionList: ISection[];
  color: string | undefined;
  name: string;
  enabled: boolean;
}

interface CourseProperties {
  displayCourse: ISubject;
  updateSectionBind: any;
  updateCourseBind: any;
}

interface ScheduleContainerProperties {
  shownShedules: ISchedule[];
  saveScheduleBind: any;
  deselected: boolean;
  setDeselected: any;
}

function ScheduleContainer({
  shownShedules,
  saveScheduleBind,
  deselected,
  setDeselected
}: ScheduleContainerProperties) {
  const [selectedButton1, setSelectedButton1] = React.useState("button");
  const [selectedButton2, setSelectedButton2] = React.useState("button");
  const [selectedButton3, setSelectedButton3] = React.useState("button");
  const [selectedButton4, setSelectedButton4] = React.useState("button");

  React.useEffect(() => {
    if(deselected){
      setSelectedButton1("button");
      setSelectedButton2("button");
      setSelectedButton3("button");
      setSelectedButton4("button");
      setDeselected(false);

    }}, [deselected]);

  return (
    <div className="schedule-container">
      <div className="schedule-flex">
        <div className="two-schedules">
          {shownShedules[0] !== undefined && (
            <button
              className={selectedButton1}
              onClick={() => {
                saveScheduleBind(shownShedules[0]);
                setSelectedButton1("button-selected");
                setSelectedButton2("button");
                setSelectedButton3("button");
                setSelectedButton4("button");
              }}
              type="button">
              {" "}
              <ScheduleViewer loadedSchedule={shownShedules[0]} />{" "}
            </button>
          )}
          {shownShedules[1] !== undefined && (
            <button
              className={selectedButton2}
              onClick={() => {
                saveScheduleBind(shownShedules[1]);
                setSelectedButton1("button");
                setSelectedButton2("button-selected");
                setSelectedButton3("button");
                setSelectedButton4("button");
              }}
              type="button">
              {" "}
              <ScheduleViewer loadedSchedule={shownShedules[1]} />{" "}
            </button>
          )}
        </div>
        <div className="two-schedules">
          {shownShedules[2] !== undefined && (
            <button
              className={selectedButton3}
              onClick={() => {
                saveScheduleBind(shownShedules[2]);
                setSelectedButton1("button");
                setSelectedButton2("button");
                setSelectedButton3("button-selected");
                setSelectedButton4("button");
              }}
              type="button" >
              {" "}
              <ScheduleViewer loadedSchedule={shownShedules[2]} />{" "}
            </button>
          )}
          {shownShedules[3] !== undefined && (
            <button
              className={selectedButton4}
              onClick={() => {
                saveScheduleBind(shownShedules[3]);
                setSelectedButton1("button");
                setSelectedButton2("button");
                setSelectedButton3("button");
                setSelectedButton4("button-selected");
              }}
              type="button"  >
              {" "}
              <ScheduleViewer loadedSchedule={shownShedules[3]} />{" "}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface GenerateButtonProperties {
  generationBind: any;
}

function GenerateButton({ generationBind }: GenerateButtonProperties) {
  function sendGenerateSignal() {
    generationBind();
  }

  return (
    <div className="generate-button-container">
      <button onClick={sendGenerateSignal} type="button"> GENERAR </button>
    </div>
  );
}

function Course({
  displayCourse,
  updateSectionBind,
  updateCourseBind,
}: CourseProperties) {
  function updateSectionEnabled(section: ISection) {
    updateSectionBind(section, { ...section, enabled: !section.enabled });
  }
  function updateCourseEnabled() {
    updateCourseBind(displayCourse, {
      ...displayCourse,
      enabled: !displayCourse.enabled,
    });
  }

  return (
    <div>
      <div className="course">
        <div className="course-name">{displayCourse.name}</div>
        <div className="add-section">
          <input onChange={updateCourseEnabled} type="checkbox" />
        </div>
      </div>
      <div>
        {displayCourse.sectionList.map((section) => {
          return (
            <div className="section">
              <div> NRC: {section.nrc} </div>
              <div className="delete-section">
                <input
                  onChange={() => updateSectionEnabled(section)}
                  disabled={!displayCourse.enabled}
                  checked={displayCourse.enabled && section.enabled}
                  type="checkbox"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GenerationInterface() {
  const [loadedSubjects, setLoadedSubjects] = React.useState<ISubject[]>();
  const [generatedSchedules, setGeneratedSchedules] =
  React.useState<ISchedule[]>();
  const [originalSchedules, setOriginalSchedules] =
    React.useState<ISchedule[]>();

  React.useEffect(() => {
    (async () => {
      if (loadedSubjects !== undefined) {
        return;
      }
      setLoadedSubjects(await loadFromServer());
    })();
  });

  const [selectedSchedule, setSelectedSchedule] = React.useState<ISchedule>();
  const [deselected, setDeselected] = React.useState<boolean>(false);

  const [scheduleIndex, setScheduleIndex] = React.useState<number>(0);

  function assignMissingColors(subjectList: ISubject[]): ISubject[] {
    let colorlist = colors;
    return subjectList.map((subject) => {
      const selectedColor =
        colorlist[Math.floor(Math.random() * colorlist.length)];
      subject.color = selectedColor;
      colorlist = colorlist.filter((color) => {
        return color !== selectedColor;
      });
      return subject;
    });
  }

  function updateCourse(subject: ISubject, newSubject: ISubject) {
    setLoadedSubjects(
      loadedSubjects?.map((x) => {
        if (x !== subject) {
          return x;
        }
        return newSubject;
      })
    );
  }

  function updateSectionFromCourse(section: ISection, newSection: ISection) {
    setLoadedSubjects(
      loadedSubjects?.map((x) => {
        if (!x.sectionList.includes(section)) return x;
        x.sectionList[x.sectionList.indexOf(section)] = newSection;
        return x;
      })
    );
  }

  React.useEffect(() => {
    (async () => {})();
  });

  async function loadSectionFromID(
    subject: ISubject,
    id: string
  ): Promise<ISection> {
    const section: ISection = await fetch(
      `http://127.0.0.1:4000/api/section/get_sections_from_id?id=${id}`,
      { headers: { Accept: "application/json" } }
    )
      .then((response) => response.json())
      .then((data) => {
        const newSection: ISection = {
          nrc: data.nrc,
          teacher: data.teacher,
          sessionList: [],
          subject: subject,
          enabled: false,
        };
        return newSection;
      });
    return section;
  }

  async function loadSectionsFromIdList(subject: ISubject, Ids: string[]) {
    if (Ids === undefined || Ids.length === 0) {
      return [];
    }
    const promises = Ids.map(async (id) => {
      return loadSectionFromID(subject, id);
    });
    return Promise.all(promises);
  }

  async function loadFromServer(): Promise<ISubject[]> {
    const subjects: Promise<ISubject>[] = await fetch(
      "http://127.0.0.1:4000/api/subjects/get_subjects",
      {
        headers: { Accept: "application/json" },
      }
    )
      .then((response) => response.json())
      .then((data: any[]) => {
        return data.map(async (subject) => {
          const newSubject: ISubject = {
            name: subject.name,
            sectionList: await loadSectionsFromIdList(
              subject,
              subject.sections
            ),
            enabled: false,
            color: undefined,
          };
          console.log(newSubject);
          return newSubject;
        });
      });
    return Promise.all(subjects);
  }

  async function fetchSessionFromId(
    id: string,
    section: ISection
  ): Promise<ISession> {
    return await fetch(
      `http://127.0.0.1:4000/api/session/get_sessions_from_id?id=${id}`,
      { headers: { Accept: "application/json" } }
    )
      .then((response) => response.json())
      .catch((e) => {
        console.error(e);
      })
      .then((data) => {
        const newSession: ISession = {
          day: data.day,
          start: new Date(data.start),
          end: new Date(data.end),
          section: section,
        };
        return newSession;
      });
  }

  async function fetchSessionsFromSection(section: ISection) {
    return await fetch(
      `http://127.0.0.1:4000/api/session/get_sessions_from_section?nrc=${section.nrc}`,
      { headers: { Accept: "application/json" } }
    )
      .then((response) => response.json())
      .catch((e) => {
        console.error("No se pudo obtener las sessiones de la seccion");
      })
      .then(async (data) => {
        if (data === undefined) {
          return;
        }
        const newSection: ISection = {
          nrc: section.nrc,
          teacher: section.teacher,
          subject: section.subject,
          sessionList:data.map((aSession:{day:number; start: Date, end:Date})=> {
						const newSession: ISession = {
							day: aSession.day,
							start: new Date(aSession.start),
							end: new Date(aSession.end),
							section: section,
						};
						return newSession;
					}),
          enabled: true,
        };
        return newSection;
      });
  }

  async function fetchSubjectFromId(
    id: string,
    section: ISection
  ): Promise<ISubject> {
    return await fetch(
      `http://127.0.0.1:4000/api/subjects/get_subjects_from_id?id=${id}`,
      { headers: { Accept: "application/json" } }
    )
      .then((response) => response.json())
      .then((data) => {
        const newSubject: ISubject = {
          color: undefined,
          enabled: true,
          name: data.name,
          sectionList: [section],
        };
        return newSubject;
      });
  }

  async function getSchedulesFromServer() {
    let sections: ISection[] = [];
    loadedSubjects?.forEach((subject) => {
      if (!subject.enabled) {
        return;
      }
      sections = sections.concat(
        subject.sectionList.filter((section) => section.enabled)
      );
    });
    // if (sections.length === 0) {
		// 	return undefined;
		// }
		// let sectionsNRCs = sections.map((section) => section.nrc);
		// const nrcString: string = sectionsNRCs.join(",");

		// const owner = email;
		// await fetch(
		// 	`http://127.0.0.1:4000/api/schedules/generate_schedules?owner=${owner}&sections=${sections}`,
		// 	{ headers: { Accept: "application/json" } },
		//)
    if (sections.length === 0) {
      return undefined;
    }
    sections = sections.map((section) => section.nrc);
		const nrcString: string = sections.join(",");

		const owner = email;
		await fetch(
			`http://127.0.0.1:4000/api/schedules/generate_schedules?owner=${owner}&nrcs=${nrcString}`,
			{ headers: { Accept: "application/json" } },
		)
			.then((response) => response.json())
			.then(async (data) => {
				let scheduleList: ISchedule[] = [];
        console.log(data);
				scheduleList = await Promise.all(
					data.map(async (schedule:Schedule) => {
						const newSchedule: ISchedule = {
							sectionList: await Promise.all(
								schedule.sections.map(async (section:Section) => {
									let newSection: ISection = {
										nrc: section.nrc,
										teacher: section.teacher,
										enabled: true,
                    sessionList: [],
                    subject: {name: section.subject.name, sectionList: [], color: undefined, enabled: true},
									};
                  newSection.subject = {name: section.subject.name, sectionList: [newSection], color: undefined, enabled: true};
									// newSection.subject = await fetchSubjectFromId(
									// 	section.subject,
									// 	section,
									// );
									const sectionConSesiones = await fetchSessionsFromSection(newSection);
                  if (sectionConSesiones !== undefined) {
                    newSection = sectionConSesiones;
                  }else{
                    console.error("No se pudo obtener las sessiones de la seccion");
                  }
									return newSection;
								}),
							),
						};
						return newSchedule;
					}),
				);
				setGeneratedSchedules(scheduleList);
        setOriginalSchedules(scheduleList);
        console.log(scheduleList);
			});
	}

  async function saveScheduleToServer(schedule: ISchedule) {
    const nrcs = schedule.sectionList.map((section) => section.nrc).join(",");
    await fetch(
      `http://127.0.0.1:4000/api/schedules/save_schedule?owner=${email}&nrcs=${nrcs}`,
      { method:"put",headers: { Accept: "application/json" } }
    )
      .then((response) => response)
      .catch((e) => {
        console.error("ERROR SAVING schedule ", e);
      });
  }

  function generateSchedules() {
    getSchedulesFromServer();
  }

  function saveSchedule(schedule?: ISchedule) {
    if (schedule === undefined) {
      return async () => {
        // pushNotification("No se ha seleccionado un horario", "error");tr
        console.error("No se ha seleccionado un horario");
      };
    }
    return async () => {
      // pushNotification("Horario guardado", "success");
      await saveScheduleToServer(schedule);
    }
  }

  function cambiarDiasLibres(dia: string){
    const día = Number.parseInt(dia);
    setGeneratedSchedules(
      originalSchedules?.filter((schedule) => {
      let va=true
      // biome-ignore lint/complexity/noForEach: <explanation>
      schedule.sectionList.forEach((section) => {
        section.sessionList.forEach((session) => {
          if(session.day===día){
            va=false;
          }
        });
      });
      return va;
    }
    ))
  }

  return (
    <div>
      <NavigationBar />
      <div className="main-container">
        <div className="course-box">
          <CourseSemesterContainer />
          <div>
            {loadedSubjects?.map((value) => {
              return (
                <Course
                  displayCourse={value}
                  updateSectionBind={updateSectionFromCourse}
                  updateCourseBind={updateCourse}
                />
              );
            })}
          </div>
          <GenerateButton generationBind={generateSchedules} />
        </div>
        {generatedSchedules !== undefined && (
          <div className="schedule-box">
            <div className="action-buttons">
              <select className="filter-button" onChange={(e)=>{cambiarDiasLibres(e.target.value)}}>
                filtro Días Libres
                <option value="1">Lunes</option>
                <option value="2">Martes</option>
                <option value="3">Miercoles</option>
                <option value="4">Jueves</option>
                <option value="5">Viernes</option>
                <option value="6">Sabado</option>
                <option value="0">Domingo</option>
              </select>
            </div>

            <ScheduleContainer
              saveScheduleBind={setSelectedSchedule}
              shownShedules={generatedSchedules.slice(
                scheduleIndex,
                scheduleIndex + 4
              )}
              deselected={deselected}
              setDeselected={setDeselected}
            
            />

            <div className="nav-buttons">
              <div className="ll-button">
                <button onClick={() => {setScheduleIndex(0); setDeselected(true)}} type="button">
                  &lt;&lt;
                </button>
              </div>
              <div className="l-button">
                <button
                  onClick={() =>
                    {setScheduleIndex(Math.max(0, scheduleIndex - 4)); setDeselected(true)}
                  }
                  type="button"
                >
                  &lt;
                </button>
              </div>
              <div className="m-button">
                <button onClick={()=>{saveSchedule(selectedSchedule);  setDeselected(true)}} type="button">Guardar</button>
              </div>
              <div className="r-button">
                <button
                  onClick={() =>{
                    setScheduleIndex(
                      Math.min(
                        Math.floor(generatedSchedules.length / 4) * 4,
                        scheduleIndex + 4
                      )
                    );
                    setDeselected(true);}
                  }
                  type="button"
                >
                  &gt;
                </button>
              </div>
              <div className="rr-button">
                <button
                  onClick={() =>{
                    setScheduleIndex(
                      Math.floor(generatedSchedules.length / 4) * 4
                    );
                    setDeselected(true);}
                  }
                  type="button"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
