import React, { useState, FormEvent, useEffect } from 'react'
import { Link } from 'react-router-dom';
import logoImg from '../../assets/images/logo.svg';
import backIcon from '../../assets/images/icons/back.svg'
import SuccessContainer from '../../components/SuccessContainer';
import api from '../../services/api';

export default function Forgot () {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    async function handleForgotPass(e: FormEvent) {
        e.preventDefault();
        try {
            await api.post('/forgot_password', {
                email
            });
            setSuccess(true);
        } catch (error) {
            console.log({ error })
            setError(error.response.data.message);
        }
    }

    useEffect(() => {
        setError('');
    }, [email])

    return (
        <div id="register-page">
            {success && <div id='register-success'>
                <SuccessContainer title="Redefinition sent!" success={success} button_text="Sign in!">
                    Instructions have been sent to your e-mail. <br />
                    The token expires in 1 hour.
                </SuccessContainer>
            </div>}
            <div id="register-page-content">
                <Link to='/' id="go-back">
                    <img src={backIcon} alt="go back" />
                </Link>
                <form onSubmit={handleForgotPass} id="register-form">
                    <fieldset>
                        <div id="register-form-header">
                            <h1>Forgot my password</h1>
                            <p id="description">
                                Do not worry, we can take care of it.
                            </p>
                            <span><strong>{error}</strong></span>
                        </div>
                        <div className="input-block" id="Email">
                            <label htmlFor="Email-input" id={Boolean(email) ? "active" : ""}>E-mail</label>
                            <input required style={{borderRadius: '10px'}} className={Boolean(error) ? "input-error" : ""} type="email" id="Email-input" onChange={(e) => {setEmail(e.target.value)}} />
                        </div>
                        <button type="submit" disabled={!Boolean(email)}>
                            Send
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