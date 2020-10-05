import React, { useContext, useEffect, useState } from 'react'
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

    const [userProfile, setUserProfile] = useState<User>({} as User);
    const [canEdit, setCanEdit] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [selectedFile, setSelectedFile] = useState<File>();
    const [bio, setBio] = useState('');

    function splitName(info: string) {
        const name = String(info).split(' ');
        setFirstName(name[0]);
        name.shift();
        setLastName(name.join(' '));
    }

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
    }, [userProfile]);

    async function handleChangeProfile(e: React.FormEvent) {
        e.preventDefault();
        const name = `${firstName} ${lastName}`
        const data = new FormData();
        
        data.append('name', name);
        data.append('bio', bio);
        data.append('whatsapp', whatsapp);
        if (selectedFile) {
			data.append('avatar', selectedFile);
        }
        try {
            const info = await api.put('profile', data, {
                withCredentials: true, 
                onUploadProgress: (event) => {
                    setUploadProgress(Math.round((100 * event.loaded) / event.total));
                }
            })
            window.history.pushState({}, "", `/profile/${user?.id}#success=${info.statusText}`);
            window.location.reload(true);
        } catch (err) {
            window.history.pushState({}, "", `/profile/${user?.id}#success=ERR`);
            if (err.response.status === 429) {
                setUploadProgress(0);
                alert(err.response.data.message);
            }
        }
    }

    function addSpaces(initial: any) {
        console.log(initial)
        return initial;
    }

    return (
        <div id="profile-page" className="container">
            <div id="percentage" style={{width: uploadProgress+'%'}} />
            <div id={deleted ? "not-found" : "not-show"}><h1 style={{fontSize: '15vw'}}>404</h1><h1 style={{textAlign: 'center'}}>Page not found.</h1></div>

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
                            <Input onChange={(e) => {setFirstName(e.target.value)}} label="First name" name="first-name" defaultValue={firstName} readOnly={!canEdit} />
                            <Input onChange={(e) => {setLastName(e.target.value)}} label="Last name" name="last-name" defaultValue={lastName} readOnly={!canEdit} />
                            {canEdit ? "" : (<Input  label="Whatsapp" readOnly name="whatsapp" defaultValue={whatsapp === 'null' ? '' : whatsapp === 'undefined' ? '' : whatsapp} onChange={addSpaces} />)}
                        </div>
                        <div id={canEdit ? "profile-communication" : "not-show"}>
                            <Input label="E-mail" name="e-mail" type="email" readOnly defaultValue={userProfile.email} />
                            <Input onChange={(e) => {setWhatsapp(e.target.value)}} label="Whatsapp" name="whatsapp" defaultValue={whatsapp === 'null' ? '' : whatsapp === 'undefined' ? '' : whatsapp} />
                        </div>
                        <Textarea onChange={(e) => {setBio(e.target.value)}} label="Biography" readOnly={!canEdit} name="bio" desc={canEdit ? "(Max. 300 characters)" : ""} defaultValue={bio === 'null' ? '' : bio === 'undefined' ? '' : bio} />
                    </fieldset>
                    
                    {canEdit ? (
                        <footer>
                            <p><img src={warningIcon} alt="Important warning"/>
                            Important <br />
                            Fill up all fields.</p>
                            <button type="submit">
                                Change profile!
                            </button>
                        </footer>
                    ) : ""}
                </form>
            </main>
        </div>
    )

}
