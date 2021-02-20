import React, { useState, FormEvent, useContext, useEffect } from 'react';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import warningIcon from '../../assets/images/icons/warning.svg'
import './styles.css';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import api from '../../services/api';
import AuthContext from '../../contexts/AuthContext';
import SuccessContainer from '../../components/SuccessContainer';
import RocketIcon from '../../assets/images/icons/rocket.svg';
import { Link } from 'react-router-dom';
import NotificationContext from '../../contexts/NotificationContext';
import { v4 } from 'uuid';
import Cleave from 'cleave.js/react';

function TeacherForm() {
    const { user } = useContext(AuthContext);
    const [bio, setBio] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [subject, setSubject] = useState('');
    const [cost, setCost] = useState('');
    const [success, setSuccess] = useState(false);
    const [scheduleItems, setScheduleItems] = useState([{ week_day: 0, from: '', to: '' }]);
    const dispatch = useContext(NotificationContext);

    function addNewScheduleItem() {
        setScheduleItems([
            ...scheduleItems,
            { week_day: 0, from: '', to: '' }
        ])
    }

    function setScheduleItemValue(position: number, field: string, value: string) {
        const newArray = scheduleItems.map((scheduleItem, index) => {
            if (index === position) {
                return {...scheduleItem, [field]: value}
            }

            return scheduleItem;
        });

        setScheduleItems(newArray);
    }

    function deleteScheduleItem(index: number) {
        if (scheduleItems.length > 1) {
            const newSchedule = scheduleItems.slice(0, index).concat(scheduleItems.slice(index + 1, scheduleItems.length));
            setScheduleItems(newSchedule);
        } else {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    type: 'ERROR',
                    message: 'You should have at least one schedule to your class!',
                    title: 'Something went wrong.',
                    id: v4(),
                }
            });
        }
    }

    function handleOnSubmitClass(e: FormEvent) {
        e.preventDefault();

        api.post('/classes', {
            subject,
            cost: cost,
            schedule: scheduleItems
        }, {withCredentials: true}).then(() => {
            setSuccess(true);
        }).catch((err) => {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    type: 'ERROR',
                    message: 'Check console dev for more details. Contact us if possible: '+err,
                    title: 'Something went wrong.',
                    id: v4(),
                }
            });
            //alert('Something went wrong! Check log for more details \n '+err);
            console.error(err);
        });
    }

    useEffect(() => {
        setWhatsapp(String(user?.whatsapp));
        setBio(String(user?.bio));
    }, [user])

    return (
        <div id="page-teacher-form" className="container">
            <SuccessContainer success={success} title="Registration saved!" button_text="Return home">
                All right, your registration is on our list of teachers. <br />
                Now just keep an eye on your WhatsApp. 😉
            </SuccessContainer>
            
            <PageHeader page="Give classes" info='Get ready! it will be amazing.' icon={RocketIcon} title="How amazing that you want to teach." description="The first step is to fill this subscription form."/>

            <main>
                <form onSubmit={handleOnSubmitClass}>
                    <fieldset>
                        <legend>Personal data</legend>
                        
                        
                        <div className="profile-and-whatsapp">
                            <div className="profile">
                                <Link to={`/profile/${user?.id}`}>
                                    <img src={user?.avatar} alt="Avatar"/>
                                </Link>
                                <Link style={{textDecoration: 'none'}} to={`/profile/${user?.id}`}>
                                    <h2>{user?.name}</h2>
                                </Link>
                            </div>
                            <Input value={whatsapp === 'null' ? 'Go to your profile and change me!' : whatsapp} required readOnly label="Whatsapp" name="whatsapp" />
                        </div>

                        <Textarea required readOnly value={bio === 'null' ? 'Go to your profile and change me!' : bio} name="bio" label="Biography" onChange={(e) => {setBio(e.target.value)}} />

                    </fieldset>

                    <fieldset>
                        <legend>About the class</legend>
                        
                        <div id="two-inputs-row">
                            <Select required name="subject" label="School subject" value={subject} onChange={(e) => {setSubject(e.target.value)}} options={[
                                { value: 'Arts', label: 'Arts' },
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
                            {/* <Cleave name="" label=""  }}>
                                
                            </Cleave> */}
                            <div className="input-block" id="Class's cost per hour">
                                <label htmlFor="cost">Class's cost per hour</label>
                                <Cleave id="cost"
                                    value={cost}
                                    required 
                                    style={{paddingLeft: '3.4rem'}}
                                    onChange={(e) => {setCost(e.target.value)}}
                                    options={{ numeral: true, numeralThousandsGroupStyle: 'thousand' }}
                                />
                                <span id="currency-span">$</span>
                            </div>
                        </div>

                    </fieldset>

                    <fieldset>
                        <legend>Available time <button type="button" onClick={addNewScheduleItem}>+ New time</button></legend>

                        {scheduleItems.map((scheduleItem, index) => {
                            return (
                                <div key={index} className="schedule-item">
                                    <Select required value={scheduleItem.week_day} custom_id="Subject" name="week_day" onChange={(e) => {setScheduleItemValue(index, 'week_day', e.target.value)}} label="Day of the week" options={[
                                        { value: '0', label: 'Sunday' },
                                        { value: '1', label: 'Monday' },
                                        { value: '2', label: 'Tuesday' },
                                        { value: '3', label: 'Wednesday' },
                                        { value: '4', label: 'Thursday' },
                                        { value: '5', label: 'Friday' },
                                        { value: '6', label: 'Saturday' },
                                    ]} />
                                    <Input required value={scheduleItem.from} onChange={(e) => {setScheduleItemValue(index, 'from', e.target.value)}} name="from" label="From" type="time"/>
                                    <Input required value={scheduleItem.to} onChange={(e) => {setScheduleItemValue(index, 'to', e.target.value)}} name="to" label="To" type="time"/>
                                    {scheduleItems.length > 1 && <div className="delete-container">
                                        <button id="delete-item" type="button" onClick={(e) => deleteScheduleItem(index)}>Delete schedule</button>
                                    </div>}
                                </div>
                            );
                        })}
                    </fieldset>

                    <footer>
                        <p><img src={warningIcon} alt="Important warning"/>
                        Important <br />
                        Fill up all fields correctly.</p>
                        <button type="submit">
                            Submit
                        </button>
                    </footer>
                </form>
            </main>
        </div>
    );
}

export default TeacherForm;