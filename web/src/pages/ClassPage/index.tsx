import logoIcon from '../../assets/images/logo.svg';
import backIcon from '../../assets/images/icons/back.svg';
import { useHistory, useParams } from 'react-router-dom';
import './styles.css';
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import TeacherItem, { Teacher } from '../../components/TeacherItem';

export default function ClassPage() {
    const history = useHistory();
    const [post, setPost] = useState<Teacher[]>([]) as any;
    const { id } = useParams() as any;

    useEffect(() => {
        let isMounted = true;
        api.get(`/classes/${id}`, { withCredentials: true }).then(teacher => {
            if (isMounted) {
                setPost(teacher.data);
            }
        })
        return () => { isMounted = false; }
    }, [id, post]);

    return (
        <div id="post-page">
            <div className="top-bar-container">
                <div className="top-bar-content">
                    <div>
                        <img onClick={history.goBack} src={backIcon} alt="go back" />
                    </div>
                    Post
                    <img onClick={() => history.push('/home')} src={logoIcon} alt="ye" />
                </div>
            </div>
            {post.map((teacher: Teacher, index: number) => {
                return <TeacherItem key={index} teacher={teacher} />;
            })}
        </div>
    )
}