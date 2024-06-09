import * as mongoose from "mongoose";

import * as CSchedules from "../modules/Schedule";
import * as mongoModels from "../modules/Schema";

// create new Schedule
const a1 = new Date(0);
const a2 = new Date(1);
const a3 = new Date(2);
const a4 = new Date(3);
const a5 = new Date(4);
const a6 = new Date(5);

const session1 = new CSchedules.Session(a1, a2);
const session2 = new CSchedules.Session(a3, a4);
const session3 = new CSchedules.Session(a5, a6);
const section1 = new CSchedules.Section("Section 1", [session1, session2]);
const section2 = new CSchedules.Section("Section 2", [session3]);
const subject1 = new CSchedules.Subject("Subject 1", [section1, section2], ["Carrera1", "Carrera2"]);
const subject2 = new CSchedules.Subject("Subject 2", [], ["carrera3"]);
const schedule1 = new CSchedules.Schedule("dehidalgo.22@est.ucab.edu.ve", [subject1, subject2]);

// connect to the database
export async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/horariospp");
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error al conectar a la base de datos\n" + error + "\n");
  }
}

// disconnect from the database
export async function disconnectFromDatabase() {
  try {
    await mongoose.disconnect();
    console.log("Desconexión exitosa de la base de datos");
  } catch (error) {
    console.error("Error al desconectar de la base de datos\n" + error + "\n");
  }
}
// saves the document
/**
 * saveSession
 */
function saveSession(session: CSchedules.Session) {
  const sessionData = session.saveSession();
  // Crear una nueva instancia de SessionModel con los datos de session1
  const docsession1 = new mongoModels.SessionModel(sessionData);
  // Guardar la sesión en la base de datos
  return docsession1;
}

/**
* saveSecction
:  */
function saveSection(section: CSchedules.Section) {
  // Convertir el objeto section a un formato que mongoose pueda entender
  const sessioni = section.hours.map((hour) => {
    // Aquí asumimos que saveSection devuelve un documento de sesión
    return saveSession(hour);
  });

  // Crear una nueva instancia de Section con los datos de las sesiones
  const docSection = new mongoModels.SectionModel({
    nrc: section.nrc,
    hours: sessioni
  });

  // Guardar la sección en la base de datos
  return docSection;
}

function saveSubject(subject: CSchedules.Subject) {
  const sectionsi = subject.sectionList.map((section) => {
    // Aquí asumimos que saveSection devuelve un objeto de sección
    const sectionData = saveSection(section);
    return new mongoModels.SectionModel(sectionData);
  });

  // Crear una nueva instancia de Subject con los datos de las secciones
  const docSubject = new mongoModels.SubjectModel({
    name: subject.name,
    sectionList: sectionsi,
    pensum: subject.pensumList,
  });

  // Guardar el tema en la base de datos
  return docSubject;
}

function saveSchedule(schedule: CSchedules.Schedule) {
  const subjects = schedule.subjects.map((subject) => {
    // Aquí asumimos que saveSubject devuelve un objeto de tema
    const subjectData = saveSubject(subject);
    return new mongoModels.SubjectModel(subjectData);
  });

  // Crear una nueva instancia de Schedule con los datos de los temas
  const docSchedule = new mongoModels.ScheduleModel({
    correo: schedule.correo,
    subjects: subjects,
  });

  // Guardar el horario en la base de datos
  return docSchedule;
}

// Guardar el horario en la base de datos
export async function saveSubjectDB(subject: CSchedules.Subject) {
  const docSubject = saveSubject(subject);
  await docSubject.save();
}
export async function saveSectionDB(Section: CSchedules.Section) {
  const docSection = saveSection(Section);
  await docSection.save();
}
export async function saveScheduleDB(Schedule: CSchedules.Schedule) {
  const docSchedule = saveSchedule(Schedule);
  await docSchedule.save();
}
export async function saveSessionDB(session: CSchedules.Session) {
  const docSession = saveSession(session);
  await docSession.save();
}
//queries

// Leer
export async function readScheduleDB() {
  return await mongoModels.ScheduleModel.find();
}

export async function readSectionDB(nrc: string) {
  return await mongoModels.SectionModel.find({ nrc: nrc });
}

export async function readSessionDB() {
  return await mongoModels.SessionModel.find();
}

export async function returnSubjects(): Promise<Array<CSchedules.Subject>>{
  const docMaterias = await mongoModels.SubjectModel.find();
  let materias: CSchedules.Subject[]= docMaterias.map((materia) => {
    let name = materia.name;
    let sections = materia.sections; // This is an array of subdocuments
    let pensum = materia.pensum;
    let sectionsi: CSchedules.Section[];
    sectionsi = sections.map((section) => {
      let nrc = section.nrc;
      let hours = section.hours; // This is an array of subdocuments

      let hoursi = hours.map((hour) => {
        let start = hour.start;
        let end = hour.end;
        let day = hour.day;
        return new CSchedules.Session(start, end, day);
      });

      return new CSchedules.Section(nrc, hoursi);
    });

    return new CSchedules.Subject(name, sectionsi, pensum);
  });
  
  return materias;
}
// Obtener una materia por su pensum
export async function readSubjectDB(carrera: string) {
  try {
    const docMaterias = await mongoModels.SubjectModel.find({pensum: carrera});
    let materias: CSchedules.Subject[]= docMaterias.map((materia) => {
    let name = materia.name;
    let sections = materia.sections; // This is an array of subdocuments
    let pensum = materia.pensum;
    let sectionsi: CSchedules.Section[];
    sectionsi = sections.map((section) => {
      let nrc = section.nrc;
      let hours = section.hours; // This is an array of subdocuments

      let hoursi = hours.map((hour) => {
        let start = hour.start;
        let end = hour.end;
        let day = hour.day;
        return new CSchedules.Session(start, end, day);
      });

      return new CSchedules.Section(nrc, hoursi);
    });

    return new CSchedules.Subject(name, sectionsi, pensum);
  });
  
  return materias;
  } catch (error) {
    console.error("Error al leer las materias de la base de datos\n" + error + "\n");
  }
} 





async function findSectionsFromSubject(sectionId: mongoose.Schema.Types.ObjectId[]){
  let docSections = [];
  sectionId.forEach(id => {
    docSections.push(mongoModels.SectionModel.find({ _id: id}));
  });

  
  
}
// Obtener una materia por su pensum
/*
 async function findSectionFromId(sectionId: mongoose.Schema.Types.ObjectId) {
  const sectionDocument: mongoModels.ISection = await mongoModels.SectionModel.find({ _id: sectionId })
  sectionDocument
} 
/* export async function readAllSubjectDB() {
  try {
    const docMaterias = await mongoModels.SubjectModel.find();
    /*class Subject {
      name: String;
      pensumList: Array<string> = [];
      sections: Array<Section> = [];

      constructor(
    name: String,
    sections?: Array<Section>,
    pensums?: Array<string>
  ) {
    this.name = name;
    this.sections = sections || [];
    this.pensumList = pensums || [];
  }
    
    let materias1: Array<CSchedules.Subject> = [];

    docMaterias.forEach(materia => {
      materias1.push(new CSchedules.Subject(materia.name,[], materia.pensum));
      for (let i = 0; i < materia.sections.length; i++) {
        let section = materia.sections[i];
        let seccion: CSchedules.Section = findSectionFromId(section._id);
      }
      materias1.push(new CSchedules.Subject(materia.name, materia.sections.map((section) => { return findSectionFromId(id) }), materia.pensum));
      let sections1: Array<CSchedules.Section> = [];
    });
  } catch (error) {
    console.error("Error al leer las materias de la base de datos\n" + error + "\n");
  }
} */




/* 
//MARK: PRUEBA Guardar los documentos
await saveSessionDB(session1);
await saveSessionDB(session2);
await saveSessionDB(session3);
await saveSectionDB(section1);
await saveSectionDB(section2);
await saveSubjectDB(subject1);
await saveSubjectDB(subject2);
await saveScheduleDB(schedule1);


console.log(Bun.inspect(await returnSubjects(), { depth: 15 }));
console.log(Bun.inspect(await readSubjectDB("carrera3"), { depth: 15 })); */

// Buscar Materias en la base de datos
/* 
    * añadir lista de Profesores a las Secciones
 */


// disconnect
