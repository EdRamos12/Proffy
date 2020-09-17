import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'
import logoImg from '../../assets/images/logo.svg';
import landingImg from '../../assets/images/landing.svg';
import studyIcon from '../../assets/images/icons/study.svg';
import giveClassesIcon from '../../assets/images/icons/give-classes.svg';
import heartIcon from '../../assets/images/icons/purple-heart.svg';
import editIcon from '../../assets/images/icons/edit.svg';
import logOutIcon from '../../assets/images/icons/log-out.svg';
import './styles.css';
import api from '../../services/api';
import AuthContext from '../../contexts/AuthContext';

const Landing: React.FC = () => {
    const {user, signOut} = useContext(AuthContext);
    const [totalConnections, setTotalConnections] = useState('...');

    useEffect(() => {
        api.get('/connections', {withCredentials: true}).then(response => {
            setTotalConnections(response.data.total);
        }).catch(err => {
            console.log(err);   
            signOut();
        });
    }, [signOut]);

    return ( 
        <div id="page-landing" className="container">
            <div id="page-landing-content">
                <div id="header">
                    <div id="user-info">
                        <img src={user?.avatar} alt="Avatar"/> 
                        {user?.name}    
                        <Link to={`/profile/${user?.id}`}><img src={editIcon} alt="Avatar"/></Link>
                    </div>
                    
                    <button id="logout" onClick={signOut}>
                        <img src={logOutIcon} alt="Power off"/>
                    </button>
                </div>

                <div className="logo">
                    <div className="logo-container">
                        <img src={logoImg} alt="Proffy"/>
                        <h2>Your online platform to study.</h2>
                    </div>
                    <img src={landingImg} alt="Studying platform" className="hero-image" />
                </div>
            </div>
            <footer>
                    <div className="text-container">
                        <p>Welcome.</p>
                        <b>What would you like to do?</b>
                    </div>

                    <span className="total-connections">
                        Total of {totalConnections} connections already made!
                        <img src={heartIcon} alt="Coração roxo"/>
                    </span>

                    <div className="buttons-container">
                        <Link to="/study" className="study">
                            <img src={studyIcon} alt="Estudar"/>
                            Study
                        </Link>

                        <Link to="/give-classes" className="give-classes">
                            <img src={giveClassesIcon} alt="Dar aulas"/>
                            Give classes
                        </Link>
                    </div>
                </footer>
        </div>
    );
}

export default Landing;