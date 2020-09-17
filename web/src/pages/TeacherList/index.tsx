import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import './styles.css'
import PageHeader from '../../components/PageHeader';
import TeacherItem, { Teacher } from '../../components/TeacherItem';
import Input from '../../components/Input';
import Select from '../../components/Select';
import SmileIcon from '../../assets/images/icons/smile.svg';
import api from '../../services/api';

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalClasses, setTotalClasses] = useState('.....');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(false);

    const [subject, setSubject] = useState('');
    const [week_day, setWeekDay] = useState('');
    const [time, setTime] = useState('');

    const [limitReached, setLimitReached] = useState(false);
    const [bottomPageValue, setBottomPageValue] = useState(0);

    async function makeSearch(e: FormEvent) {
        e.preventDefault();
        window.history.pushState({}, "", `/study?subject=${subject}&week_day=${week_day}&time=${time}`);
        setTotal(0);
        setPage(1);
        setTeachers([] as any);
        setLimitReached(false);
        setSearch(true);
        setLoading(true);
    }

    useEffect(() => {
        api.get('/total_classes', {withCredentials: true}).then((info) => {
            setTotalClasses(info.data.total);
        });

        if (window.location.search) {
            const searchInfo = window.location.search.replace('?', '').split('&').map((value) => value.split('='));
            if (searchInfo.length === 3) {
                console.log(searchInfo.indexOf(['subject']));
                if (searchInfo[0].length === 2 && searchInfo[0].includes('subject')) setSubject(searchInfo[0][1].replace('%20', ' '));
                if (searchInfo[1].length === 2 && searchInfo[1].includes('week_day')) setWeekDay(searchInfo[1][1]);
                if (searchInfo[2].length === 2 && searchInfo[2].includes('time')) setTime(searchInfo[2][1]);
                setSearch(true);
            }
        }

        setLoading(true);

        function handleScroll() {
            if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.scrollHeight-700) return;
            if (bottomPageValue === document.documentElement.scrollHeight) return;
            setBottomPageValue(document.documentElement.scrollHeight);
            setLoading(true);
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [bottomPageValue]);

    const loadClasses = useMemo(() => async function a() {
        if (total > 0 && teachers.length === total) {
            setLoading(false);
            setLimitReached(true);
            return;
        }
        if (limitReached) {
            setLoading(false);
            return;
        }
        let response;
        if (search) {
            response = await api.get('/classes', {
                params: {
                    page,
                    subject,
                    week_day,
                    time
                }, 
                withCredentials: true
            });
            if (page === 1) {
                setTeachers(response.data as any);
            } else {
                setTeachers([...teachers, ...response.data] as any);
            }
        } else {
            response = await api.get('/classes', {
                params: {
                    page,
                }, 
                withCredentials: true
            });
            setTeachers([...teachers, ...response.data] as any);
        }
        if (response.data.length === 0) {
            setLoading(false);
            setLimitReached(true);
            return;
        }
        setPage(page+1);
        setLoading(false);
        setTotal(response.headers['x-total-count']);
        return;
    }, [limitReached, search, subject, time, week_day, page, teachers, total]);

    useEffect(() => {
        if (!loading) return;
        loadClasses();
    }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps
    
    return (
        <div id="page-teacher-list" className="container">
            <PageHeader icon={SmileIcon} info={`We have ${totalClasses} total classes.`} title="These are the available teachers." page="Study">
                <form id="search-teachers" onSubmit={makeSearch}>
                    <Select value={subject} onChange={(e) => {setSubject(e.target.value)}} required name="subject" label="School subject" options={[
                        { value: 'Art', label: 'Art' },
                        { value: 'Biology', label: 'Biology' },
                        { value: 'Chemistry', label: 'Chemistry' },
                        { value: 'Physical education', label: 'Physical education' },
                        { value: 'Physics', label: 'Physics' },
                        { value: 'Geography', label: 'Geography' },
                        { value: 'History', label: 'History' },
                        { value: 'Math', label: 'Math' },
                        { value: 'English', label: 'English' },
                        { value: 'Philosophy', label: 'Philosophy' },
                        { value: 'Sociology', label: 'Sociology' },
                    ]} />
                    <Select value={week_day} onChange={(e) => {setWeekDay(e.target.value)}} required name="week_day" label="Day of the week" options={[
                        { value: '0', label: 'Sunday' },
                        { value: '1', label: 'Monday' },
                        { value: '2', label: 'Tuesday' },
                        { value: '3', label: 'Wednesday' },
                        { value: '4', label: 'Thursday' },
                        { value: '5', label: 'Friday' },
                        { value: '6', label: 'Saturday' },
                    ]} />
                    <Input value={time} onChange={(e) => {setTime(e.target.value)}} required type="time" name="time" label="Time of the day" />
                    <button type="submit">Search</button>
                </form>
            </PageHeader>
            <main >
                {teachers.map((teacher: Teacher, index) => {
                    return <TeacherItem key={index} teacher={teacher} />;
                })}
                <span id="limit-message">
                    {limitReached && 'These are all the results' }
                    {loading && 'Loading...'} <br /> 
                    {total === 0 && limitReached ? 'No teacher Found.' : ''}
                </span>
            </main>
        </div>
    );
}

export default TeacherList;