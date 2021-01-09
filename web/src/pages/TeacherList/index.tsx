import React, { useState, FormEvent, useEffect, useMemo, useContext } from 'react';
import './styles.css'
import PageHeader from '../../components/PageHeader';
import TeacherItem, { Teacher } from '../../components/TeacherItem';
import Input from '../../components/Input';
import Select from '../../components/Select';
import SmileIcon from '../../assets/images/icons/smile.svg';
import api from '../../services/api';
import PostStorage from '../../contexts/PostStorage';

function paramsToObject(params: any) {
    const urlParams = new URLSearchParams(params);
    return Object.fromEntries(urlParams);
}

const TeacherList = () => {
    // load chunked posts
    const { storedPage, chunkInfo, storedPosts } = useContext(PostStorage);

    //actual posts
    const [teachers, setTeachers] = useState([]);

    // general values
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalClasses, setTotalClasses] = useState('.....');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(false);

    // search thing
    const [subject, setSubject] = useState('');
    const [week_day, setWeekDay] = useState('');
    const [time, setTime] = useState('');

    // no more posts to load
    const [limitReached, setLimitReached] = useState(false);

    // scroll value 
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

    const checkChunkedPosts = useMemo(() => async function a() {
        if (storedPosts !== null && storedPosts !== teachers) {
            //console.log(storedPosts, teachers)
            setPage(storedPage + 1);
            setTeachers(storedPosts as never[]);
            //console.log('is it?', teachers);
        } else {
            if (window.location.search) {
                console.log('about that')
                const params = paramsToObject(window.location.search);
                if (!!params.subject && !!params.week_day && !!params.time) {
                    setSubject(params.subject.replace('%20', ' '));
                    setWeekDay(params.week_day);
                    setTime(params.time);
                    setSearch(true);
                }
            }
            //initial page load
            setLoading(true);
        }
    }, [storedPosts, storedPage, teachers]);

    useEffect(() => {
        const params = paramsToObject(window.location.search);
        if (!params.subject && !params.week_day && !params.time) {
            window.history.pushState({}, "", "");
            console.log("wow")
            setTeachers([]);
            setPage(1);
            setSearch(false);
            chunkInfo(1, []);
            setLoading(true);
        }
    }, [window.location.search]);

    useEffect(() => {
        api.get('/total_classes', { withCredentials: true }).then((info) => {
            setTotalClasses(info.data.total);
        });

        checkChunkedPosts();

        function handleScroll() {
            if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.scrollHeight - 700) return;
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
        setPage(page + 1);
        setLoading(false);
        setTotal(response.headers['x-total-count']);
        chunkInfo(page, [...teachers, ...response.data]);
        console.log(page);
        return;
    }, [limitReached, search, subject, time, week_day, page, teachers, total, chunkInfo]);

    useEffect(() => {
        if (!loading) return;
        loadClasses();
    }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div id="page-teacher-list" className="container">
            <PageHeader icon={SmileIcon} info={`We have ${totalClasses} total classes.`} title="These are the available teachers." page="Study">
                <form id="search-teachers" onSubmit={makeSearch}>
                    <Select value={subject} onChange={(e) => { setSubject(e.target.value) }} required name="subject" label="School subject" options={[
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
                    <Select value={week_day} onChange={(e) => { setWeekDay(e.target.value) }} required name="week_day" label="Day of the week" options={[
                        { value: '0', label: 'Sunday' },
                        { value: '1', label: 'Monday' },
                        { value: '2', label: 'Tuesday' },
                        { value: '3', label: 'Wednesday' },
                        { value: '4', label: 'Thursday' },
                        { value: '5', label: 'Friday' },
                        { value: '6', label: 'Saturday' },
                    ]} />
                    <Input value={time} onChange={(e) => { setTime(e.target.value) }} required type="time" name="time" label="Time of the day" />
                    <button type="submit">Search</button>
                </form>
            </PageHeader>
            <main >
                {teachers.map((teacher: Teacher, index) => {
                    return <TeacherItem key={index} teacher={teacher} />;
                })}
                <span id="limit-message">
                    {limitReached && 'These are all the results'}
                    {loading && 'Loading...'} <br />
                    {total === 0 && limitReached ? 'No teacher Found.' : ''}
                </span>
            </main>
        </div>
    );
}

export default TeacherList;