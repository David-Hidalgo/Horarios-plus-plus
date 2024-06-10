import mongoose from "mongoose"
import { Schedule, Section, Session } from "../models/models.js"
import type { isConstructorDeclaration } from "typescript";

export function sessionRoutes(app) {  
  app.get('/api/session/get_sessions_from_id', async (req, res) => {
    if (req.query.id === undefined) { res.send(undefined); return; }

    const session = await Session.findById(req.query.id)
    if (session === undefined) { res.send(undefined); return; }

    res.send(session)
  })

  app.get('/api/session/get_sessions_from_section', async (req, res) => {
    if (req.query.nrc === undefined) { res.send(undefined); return; }

    const section = (await Section.find({ nrc: req.query.nrc })).at(0)
    if (section === undefined) { res.send(undefined); return; }

    res.send(section.sessions)
  })

  app.get('/api/session/add_session_to_section', async (req, res) => {
    if (req.query.day === undefined ||
      req.query.start === undefined ||
      req.query.end === undefined) {
        console.log("Alguno de los argumentos es undefined")
        res.send(undefined)
        return
      }

    const section = (await Section.find({ nrc: req.query.nrc })).at(0)
    if (section === undefined) {
      console.log("No se encontro " + req.query.nrc)
      res.send(undefined);
      return;
    }

    const newSession = new Session({
      _id: new mongoose.mongo.ObjectId,
      day: 0,
      start: req.query.start,
      end: req.query.end,
      section: new mongoose.mongo.ObjectId(section._id)
    })
    await newSession.save()
    await Section.findOneAndUpdate(section, { sessions: section.sessions.concat(newSession) })

    res.send(newSession)
  })

  app.get('/api/session/updateSession', async(req, res) =>{
    const oldDay = req.query.oldday
    const oldStart = req.query.oldstart
    const oldEnd = req.query.oldend

    const newDay = req.query.newday
    const newStart = req.query.newstart
    const newEnd = req.query.newend

    const oldSession = { day: oldDay, start: oldStart, end: oldEnd }

    if (oldDay === undefined || oldStart === undefined || oldEnd === undefined ||
      newDay === undefined || newStart === undefined || newEnd === undefined || req.query.nrc === undefined) {
      console.log("Could not update session, one of the arguments is undefined")
      res.send(undefined)
      return
    }

    const newSession = { day: newDay, start: newStart, end: newEnd }
    if (await Session.exists({ ...newSession, nrc: req.query.nrc })) {
      console.log("An identical session already exists")
      res.send(undefined)
      return;
    }

    const section = await Section.findOne({ nrc: req.query.nrc })
    if (section === undefined) {
      console.log("No section with nrc ", nrc, " exists")
      res.send(undefined)
      return;
    }
    
    const oldSessionObject = await Session.findOneAndUpdate({ ...oldSession, section: new mongoose.mongo.ObjectId(section._id)}, newSession)
    if (oldSessionObject === undefined) {
      console.log("Could not find and update oldSession: ", oldSession)
      res.send(undefined)
      return 
    }

    console.log("Updated session ", oldSessionObject, " to ", newSession)
    res.send(newSession)
  })

  app.get('/api/session/delete_session', async(req, res) =>{
    const sectionNRC = req.query.nrc
    const dayToDelete = req.query.day
    const startToDelete = req.query.start
    const endToDelete = req.query.end

    const toDeleteSession = {
      day: dayToDelete,
      start: startToDelete,
      end: endToDelete
    }

    if (dayToDelete === undefined || startToDelete === undefined || endToDelete ===  undefined || sectionNRC === undefined) {
      console.log("DELETE_SESSION ERROR: an item is undefined ", toDeleteSession)
      res.send(undefined)
      return 
    }
    
    const section = await Section.findOne({ nrc: sectionNRC })
    if (section === undefined) {
      console.log("DELETE_SECSION ERROR: no section has nrc ", sectionNRC)
      res.send(undefined)
      return 
    }

    const schedules = await Schedule.find()
    schedules.forEach(async schedule => {
      if (schedule.sections.some(x => x.equals(section._id))) {
        await Schedule.deleteOne(schedule)
      }
    })
    
    const session = await Session.findOne({ ...toDeleteSession, section: new mongoose.mongo.ObjectId(section._id)})
    if (session === undefined) {
      console.log("DELETE_SESSION ERROR: doesn't exist ", toDeleteSession)
      res.send(undefined)
      return 
    }

    await Section.findOneAndUpdate(section,
    { sessions: section.sessions.filter(id => !id.equals(session._id)) })

    const response = await Session.deleteOne(session);
    res.send(response)
  })
}