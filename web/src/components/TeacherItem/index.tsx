import React, { useState, useEffect, useCallback, useContext } from 'react';
import './styles.css'
import whatsappIcon from '../../assets/images/icons/whatsapp.svg';
import trashIcon from '../../assets/images/icons/trash.svg';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

interface Schedule {
    week_day: number;
    from: number;
    to: number;
    class_id: number;
}


interface ScheduleProps {
    schedule: Schedule[];
    week_day: number;
    style?: Object;
    id?: string;
}

export interface Teacher {
    avatar: string;
    bio: string;
    cost: number;
    id: number;
    name: string;
    subject: string;
    whatsapp: string;
    user_id: number;
    schedule: Schedule[];
};

interface teacherItemProps {
    teacher: Teacher;
}

const ScheduleItem: React.FC<ScheduleProps> = ({ schedule, week_day, ...rest }) => {
    const sortedSchedule = schedule.sort(function (a, b) {
        return a.week_day - b.week_day;
    });

    const [currentMinute, setCurrentMinute] = useState<String[]>([]);
    const [hasSchedule, setHasSchedule] = useState(false);
    const [currentDay, setCurrentDay] = useState('');

    const week = [
        { value: '0', label: 'Sunday' },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
    ];

    function searchSchedule(nameKey: any, Schedule: any) {
        for (let i = 0; i < Schedule.length; i++) {
            if (Schedule[i].week_day === nameKey) {
                return Schedule[i];
            }
        }
        return false;
    }

    function searchWeek(nameKey: any, WeekArray: any) {
        for (let i = 0; i < WeekArray.length; i++) {
            if (WeekArray[i].value === nameKey) {
                return WeekArray[i].label;
            }
        }
        return false;
    }

    function convertMinsToHrsMins(mins: number) {
        let hours = Math.floor(Number(mins) / 60);
        let minutes = Number(mins) % 60;
        return `${hours < 10 ? '0' + hours : hours}h${minutes < 10 ? '0' + minutes : minutes}`;
    }

    const displayScheduleOnScreen = useCallback(() => {
        const result = searchSchedule(week_day, sortedSchedule);
        const scheduleFromHrs = convertMinsToHrsMins(result.from);
        const scheduleToHrs = convertMinsToHrsMins(result.to);
        setHasSchedule(Boolean(result));
        setCurrentMinute([scheduleFromHrs, scheduleToHrs]);
        setCurrentDay(searchWeek(String(week_day), week));
    }, [sortedSchedule, week, week_day]);

    useEffect(displayScheduleOnScreen, []);

    return (
        <div className="item" id={hasSchedule ? '' : 'schedule-disabled'} {...rest} >
            <div>
                <p>Day</p>
                <h2>{currentDay}</h2>
            </div>
            <div>
                <p>Time</p>
                <h2>{hasSchedule ? `${currentMinute[0]} - ${currentMinute[1]}` : '-'}</h2>
            </div>
        </div>
    );
}

const TeacherItem: React.FC<teacherItemProps> = ({ teacher }) => {
    const { user } = useContext(AuthContext);

    function createConnection() {
        api.post('/connections', {
            user_id: teacher.user_id
        }, {withCredentials: true});
    }

    async function handleDelete() {
        const result = window.confirm('Are you sure you want to delete your class?');
        if (result) {
            await api.delete('/classes/'+teacher.id, {withCredentials: true});
            alert('Class deleted.');
            window.location.reload();
        }
    }

    return (
        <article className="teacher-item">
            <header>
                <Link to={`/profile/${teacher.user_id}`}>
                    <img src={teacher.avatar} alt="" />
                </Link>
                <div>
                    <Link to={`/profile/${teacher.user_id}`}><strong>{teacher.name}</strong></Link>
                    <span>{teacher.subject}</span>
                </div>
                { user?.id === teacher.user_id && 
                    <button id='can-edit' onClick={handleDelete}>
                        <img src={trashIcon} alt="Delete" />
                    </button>
                }
            </header>
            <p>{teacher.bio}</p>
            <div id="schedules">
                <div className="top-container">
                    <ScheduleItem schedule={teacher.schedule} week_day={0} />
                    <ScheduleItem schedule={teacher.schedule} week_day={1} />
                    <ScheduleItem schedule={teacher.schedule} week_day={2} />
                    <ScheduleItem schedule={teacher.schedule} week_day={3} />
                </div>
                <div className="bottom-container">
                    <ScheduleItem schedule={teacher.schedule} week_day={4} />
                    <ScheduleItem schedule={teacher.schedule} week_day={5} />
                    <ScheduleItem schedule={teacher.schedule} week_day={6} />
                </div>
            </div>
            <footer>
                <div>
                    <p>Price/Hour <strong>$ {teacher.cost}</strong></p>
                </div>
                <a rel="noopener noreferrer" target="_blank" onClick={createConnection} href={`https://wa.me/${teacher.whatsapp}`}>
                    <img src={whatsappIcon} alt="" />
                    Enter in contact
                </a>
            </footer>
        </article>
    );
}

export default TeacherItem;