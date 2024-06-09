interface iSession {
	start: Date;
	end: Date;
	day?: number;
}
class Session implements iSession {
	public start;
	public end;
	public day;
	constructor(start: Date, end: Date, day?: number) {
		this.start = start;
		this.end = end;
		if ("undefined" === typeof day) this.day = start.getDay();
		else this.day = day;
	}
}
interface iSubject {
	name: string;
	sections: Section[];
	career: Career | string;
}
class Subject implements iSubject {
	public name;
	public sections;
	public career;
	constructor(name: string, sections: Section[], career: Career | string) {
		this.name = name;
		this.sections = sections;
		this.career = career;
	}
}
interface iCareer {
	name: string;
	subjects: Subject[];
}
class Career implements Career {
	name;
	subjects;
	constructor(name: string, subjects: Subject[]) {
		this.name = name;
		this.subjects = subjects;
	}
}
interface iSection {
	nrc: number;
	teacher: string;
	sessions: Session[];
	subject: Subject;
}
class Section implements iSection {
	nrc;
	teacher;
	sessions;
	public subject;
	constructor(
		nrc: number,
		teacher: string,
		sessions: Session[],
		subject: Subject,
	) {
		this.nrc = nrc;
		this.teacher = teacher;
		this.sessions = sessions;
		this.subject = subject;
		this.subject.sections.push(this);
	}
}
interface iSchedule {
	owner: string;
	sections: Section[];
}
class Schedule {
	owner;
	sections;
	constructor(owner: string, sections: Section[]) {
		this.owner = owner;
		this.sections = sections;
	}
}

export { Session, Subject, Career, Section, Schedule };
export type { iSession, iSubject, iCareer, iSection, iSchedule };