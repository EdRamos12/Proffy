import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader';
import profileBackground from '../../assets/images/profile-background.svg';
import './styles.css';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import Input from '../../components/Input';
import warningIcon from '../../assets/images/icons/warning.svg';
import Textarea from '../../components/Textarea';
import Dropzone from '../../components/Dropzone';
import NotificationContext from '../../contexts/NotificationContext';
import { v4 } from 'uuid';
import TeacherItem, { Teacher } from '../../components/TeacherItem';
import PostStorage from '../../contexts/PostStorage';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

interface User {
    avatar: string;
    name: string;
    bio: string;
    whatsapp: string;
    confirmed: number;
    total_connections: number;
    id: number;
    email: string;
}

export default function Profile() {
    const { user } = useContext(AuthContext);
    const { id = user?.id } = useParams() as any;
    const dispatch = useContext(NotificationContext);
    const { storedProfilePosts, chunkProfilePostsInfo } = useContext(PostStorage);

    const [userProfile, setUserProfile] = useState<User>({} as User);
    const [canEdit, setCanEdit] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [selectedFile, setSelectedFile] = useState<File>();
    const [bio, setBio] = useState('');

    // classes thingy
    const [teachers, setTeachers] = useState([]); // posts
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    // no more posts to load
    const [limitReached, setLimitReached] = useState(false);

    // scroll value 
    const [bottomPageValue, setBottomPageValue] = useState(0);

    function splitName(info: string) {
        const name = String(info).split(' ');
        setFirstName(name[0]);
        name.shift();
        setLastName(name.join(' '));
    };

    const checkChunkedPosts = useMemo(() => async function a() {
        if (storedProfilePosts[id] !== undefined && storedProfilePosts[id].teacher !== teachers) {
            setPage(storedProfilePosts[id].page + 1);
            setTeachers(storedProfilePosts[id].teacher as never[]);
        } else {
            setLoading(true);
        }
    }, [storedProfilePosts, teachers]);

    // loading actual profile
    useEffect(() => {
        let isMounted = true;
        if (Number(user?.id) === Number(id)) {
            setUserProfile(user as User);
            splitName(String(user?.name));
            setCanEdit(true);
        } else {
            api.get(`/profile/${id}`, { withCredentials: true }).then(profile => {
                if (isMounted) {
                    setUserProfile(profile.data);
                    splitName(profile.data.name);
                }
            }).catch(err => {
                setDeleted(true)
            });
            setCanEdit(false);
        }
        return () => { isMounted = false; }
    }, [id, user]);

    useEffect(() => {
        setWhatsapp(String(userProfile.whatsapp));
        setBio(String(userProfile.bio));
        console.log(userProfile.whatsapp);
    }, [userProfile]);

    useEffect(() => {
        // api.get(`/total_classes/user/${id}`, { withCredentials: true }).then((info) => {
        //     setTotalClasses(info.data.total);
        // });
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
        console.log(page);
        if (total > 0 && teachers.length === total) {
            setLoading(false);
            setLimitReached(true);
            return;
        }
        if (limitReached) {
            setLoading(false);
            return;
        }
        let response = await api.get('/classes', {
            params: {
                page,
                user_id: id
            },
            withCredentials: true
        });
        setTeachers([...teachers, ...response.data] as any);
        if (response.data.length === 0) {
            setLoading(false);
            setLimitReached(true);
            return;
        }
        setPage(page + 1);
        setLoading(false);
        setTotal(response.headers['x-total-count']);
        chunkProfilePostsInfo(page, [...teachers, ...response.data], Number(id));
        return;
    }, [limitReached, page, teachers, total]);

    useEffect(() => {
        if (!loading) return;
        loadClasses();
    }, [loading]);

    async function handleChangeProfile(e: React.FormEvent) {
        e.preventDefault();
        const name = `${firstName} ${lastName}`
        const data = new FormData();

        data.append('name', name);
        data.append('bio', bio);
        data.append('whatsapp', whatsapp.replaceAll(' ', ''));
        if (selectedFile) {
            data.append('avatar', selectedFile);
        }
        try {
            await api.put('profile', data, {
                withCredentials: true,
                onUploadProgress: (event) => {
                    setUploadProgress(Math.round((100 * event.loaded) / event.total));
                }
            })
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    type: 'SUCCESS',
                    message: 'Your profile has been successfully updated.',
                    title: 'Profile updated!',
                    id: v4(),
                }
            });
            setUploadProgress(0);
        } catch (err) {
            if (err.response.status === 429) {
                setUploadProgress(0);
                dispatch({
                    type: "ADD_NOTIFICATION",
                    payload: {
                        type: 'ERROR',
                        message: err.response.data.message,
                        title: 'Something went wrong.',
                        id: v4(),
                    }
                });
            }
        }
    }

    function addSpaces(initial: any) {
        console.log(initial)
        return initial;
    }

    return (
        <div id="profile-page" className="container">
            <div id="percentage" style={{ width: uploadProgress + '%' }} />
            {deleted && <div id="not-found"><h1 style={{ fontSize: '15vw' }}>404</h1><h1 style={{ textAlign: 'center' }}>Page not found.</h1></div>}

            <PageHeader background={profileBackground} page={canEdit ? 'My profile' : userProfile.name}>
                <div className="profile">
                    {canEdit ? <Dropzone onFileUpload={setSelectedFile} /> : <div id="image-container"><img id="avatar" src={userProfile.avatar} alt="Avatar" /></div>}
                    <h1>{firstName} {lastName}</h1>
                    <p>got {userProfile.total_connections} connections on total!</p>
                </div>
            </PageHeader>

            <main>
                <form onSubmit={handleChangeProfile}>
                    <fieldset>
                        <legend>About me</legend>
                        <div id="profile-name">
                            <Input onChange={(e) => { setFirstName(e.target.value) }} label="First name" name="first-name" defaultValue={firstName} readOnly={!canEdit} />
                            <Input onChange={(e) => { setLastName(e.target.value) }} label="Last name" name="last-name" defaultValue={lastName} readOnly={!canEdit} />
                            {!canEdit && <Input label="Whatsapp" readOnly name="whatsapp" defaultValue={whatsapp === 'null' ? '' : whatsapp === 'undefined' ? '' : whatsapp} onChange={addSpaces} />}
                        </div>
                        <div id={canEdit ? "profile-communication" : "not-show"}>
                            <Input label="E-mail" name="e-mail" type="email" readOnly defaultValue={userProfile.email} />
                            {/* <Input defaultValue={whatsapp === 'null' ? '' : whatsapp === 'undefined' ? '' : whatsapp} /> */}
                            <div className="input-block" id="Whatsapp">
                                <label htmlFor="whatsapp">Whatsapp</label>
                                <Cleave id="whatsapp"
                                    value={whatsapp}
                                    required
                                    onChange={(e) => { setWhatsapp(e.target.value) }}
                                    options={{ prefix: '+55', phone: true, phoneRegionCode: 'BR' }}
                                />
                            </div>
                        </div>
                        <Textarea onChange={(e) => { setBio(e.target.value) }} label="Biography" readOnly={!canEdit} name="bio" desc={canEdit ? "(Max. 300 characters)" : ""} defaultValue={bio === 'null' ? '' : bio === 'undefined' ? '' : bio} />
                    </fieldset>

                    {canEdit &&
                        <footer>
                            <p><img src={warningIcon} alt="Important warning" />
                            Important <br />
                            Fill up all fields.</p>
                            <button type="submit">
                                Change profile!
                            </button>
                        </footer>
                    }
                </form>
            </main>

            {canEdit ? <h1>Your published classes:</h1> : <h1>Classes from this user:</h1>}

            <div id="class-posts">
                {teachers.map((teacher: Teacher, index) => {
                    return <TeacherItem key={index} teacher={teacher} />;
                })}
                <span id="limit-message">
                    {limitReached && 'These are all the results'}
                    {loading && 'Loading...'} <br />
                    {total === 0 && limitReached ? 'No teacher Found.' : ''}
                </span>
            </div>
        </div>
    )

}
