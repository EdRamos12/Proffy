import React, { useState, FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/images/logo.svg';
import backIcon from '../../assets/images/icons/back.svg'
import './styles.css';
import api from '../../services/api';
import SuccessContainer from '../../components/SuccessContainer';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleRegister(e: FormEvent) {
        e.preventDefault();
        setError('');
        const name = `${firstName} ${lastName}`
        try {
            const info = await api.post('/register', {
                name,
                email,
                password
            }, { withCredentials: true });
            if (Boolean(info)) {
                setSuccess(true)
            }
        } catch (error) {
            setError(error.response.data.message);
        }
    }

    function handleDisabledButton() {
        if (email.length !== 0 && password.length !== 0 && firstName.length !== 0 && lastName.length !== 0) {
            return false;
        }
        return true;
    }

    useEffect(() => {
        setError('');
    }, [firstName, lastName, password, email])

    return (
        <div id="register-page">
            <SuccessContainer title="Registered successfully" success={success} button_text="Sign in!">
                Now, go check your e-mail to get be part of Proffy. <br />
                Have a nice experience.
            </SuccessContainer>
            <div id="register-page-content">
                <Link to='/' id="go-back">
                    <img src={backIcon} alt="go back" />
                </Link>
                <form onSubmit={handleRegister} id="register-form">
                    <fieldset>
                        <div id="register-form-header">
                            <h1>Register</h1>
                            <p id="description">
                                Fill in the details below <br /> to get started. 
                            </p>
                            <span><strong>{error}</strong></span>
                        </div>

                        <div className="input-block" id="First-name">
                            <label htmlFor="First-name-input" id={Boolean(firstName) ? "active" : ""}>First name</label>
                            <input id="First-name-input" className={Boolean(error) ? "input-error" : ""} onChange={(e) => {setFirstName(e.target.value)}} />
                        </div>
                        <div className="input-block" id="Last-name">
                            <label htmlFor="Last-name-input" id={Boolean(lastName) ? "active" : ""}>Last name</label>
                            <input id="Last-name-input" className={Boolean(error) ? "input-error" : ""} onChange={(e) => {setLastName(e.target.value)}} />
                        </div>
                        <div className="input-block" id="Email">
                            <label htmlFor="Email-input" id={Boolean(email) ? "active" : ""}>Email</label>
                            <input type="email" id="Email-input" className={Boolean(error) ? "input-error" : ""} onChange={(e) => {setEmail(e.target.value)}} />
                        </div>
                        <div className="input-block" id="Password">
                            <label htmlFor="Password-input" id={Boolean(password) ? "active" : ""}>Password</label>
                            <input type="password" id="Password-input" className={Boolean(error) ? "input-error" : ""} onChange={(e) => {setPassword(e.target.value)}} />
                        </div>
                        <button type="submit" disabled={handleDisabledButton()}>
                            Complete registration!
                        </button>
                    </fieldset>
                </form>
                <div id="register-bg-container">
                    <div id="register-bg-items-container">
                        <div>
                            <img src={logoImg} alt="Proffy"/>
                            <h2>Your online platform <br /> to study.</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}