import express from 'express';

import * as CSchedules from '../modules/Schedule';
import {
  connectToDatabase,
  disconnectFromDatabase,
  returnSubjects,
    saveSubjectDB
} from './ControllerDB';
import {
  type ISubject,
  type ISection,
  type ISession,
} from "./../Interfaces/TimeBlockInterface";
import { json } from 'react-router-dom';

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

function transformSessionToI(session:CSchedules.Session, aSectionI:ISection) {

    return {
        day: session.day,
        start: session.start,
        end: session.end,
        section: aSectionI,
    };
}

function transformSectionToI(section:CSchedules.Section,aSubjectI:ISubject) {
    let aSectionI:ISection;
    let sessions:ISession[]=section.hours.map((session)=>{
        
        return transformSessionToI(session, aSectionI);
    });
    return {
        nrc:section.nrc,
        teacher:"profeDefault",
        course:aSubjectI,
        classesList:sessions
    };
}

function transformSubjectToI(subject:CSchedules.Subject) {
    let aSubjectI:ISubject;
    let sections:ISection[]=subject.sectionList.map((section)=>{
        return transformSectionToI(section,aSubjectI);
    });
    return {
        name:subject.name,
        pensumList:subject.pensumList,
        sectionList:sections
    }
}
// Crear una instancia de Express
const cors = require("cors");
const app = express();


app.use(cors());

// Ruta para obtener las clases
app.get('/getClasses', async (req, res) => {
    try {
        await connectToDatabase();
        // Obtener los Subjects de la base de datos
        const subjects = await returnSubjects();
        await disconnectFromDatabase();
        // Enviar los Subjects como respuesta
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las clases' });
    }
});

// Ruta para guardar una sección
app.post('/guardarSeccion', async (req, res) => {
    try {
        await connectToDatabase();
        // Obtener el JSON de materias por guardar del cuerpo de la solicitud
        const { materias } = req.body;

        let SubjectsToSave:CSchedules.Subject[]=JSON.parse(materias);
        for (const subject of SubjectsToSave) {
            
            await saveSubjectDB(subject);
        }
        await disconnectFromDatabase();
        // Llamar a la función saveSubject para guardar las materias

        // Enviar una respuesta exitosa
        res.json({ message: 'Materias guardadas exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar las materias' });
    }
});

// Iniciar el servidor en el puerto 4000
app.listen(4000, () => {
    console.log('Servidor iniciado en el puerto 4000');
});

console.log(JSON.stringify(session1));
