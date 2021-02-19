import React, { useState, FormEvent, useEffect, useContext } from 'react'
import { Link, useParams } from 'react-router-dom';
import logoImg from '../../assets/images/logo.svg';
import backIcon from '../../assets/images/icons/back.svg'
import SuccessContainer from '../../components/SuccessContainer';
import api from '../../services/api';

export default function Reset() {
    const { token } = useParams() as any;

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');

    async function handleForgotPass(e: FormEvent) {
        e.preventDefault();
        try {
            await api.post('/reset_password', {
                token,
                password
            });
            setSuccess(true);
        } catch (error) {
            console.log({ error })
            setError(error.response.data.message);
        }
    }

    useEffect(() => {
        setError('');
    }, [password])

    return (
        <div id="register-page">
            <SuccessContainer title="Password reset!" success={success} button_text="Sign in!">
                Your password has been successfully redefined! <br />
                 You can now log in to the app.
            </SuccessContainer>
            <div id="register-page-content">
                <Link to='/' id="go-back">
                    <img src={backIcon} alt="go back" />
                </Link>
                <form onSubmit={handleForgotPass} id="register-form">
                    <fieldset>
                        <div id="register-form-header">
                            <h1>Reset password</h1>
                            <p id="description">
                                Insert a new password to log in.
                            </p>
                            <span><strong>{error}</strong></span>
                        </div>
                        <div className="input-block" id="Password">
                            <label htmlFor="Password-input" id={Boolean(password) ? "active" : ""}>New password</label>
                            <input required style={{ borderRadius: '10px' }} className={Boolean(error) ? "input-error" : ""} type="password" id="Password-input" onChange={(e) => { setPassword(e.target.value) }} />
                        </div>
                        <button type="submit" disabled={!Boolean(password)}>
                            Send
                        </button>
                    </fieldset>
                </form>
                <div id="register-bg-container">
                    <div id="register-bg-items-container">
                        <div>
                            <img src={logoImg} alt="Proffy" />
                            <h2>Your online platform <br /> to study.</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}