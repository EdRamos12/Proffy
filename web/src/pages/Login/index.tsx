import React, { useState, useContext, FormEvent, useEffect } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import logoImg from '../../assets/images/logo.svg';
import heartIcon from '../../assets/images/icons/purple-heart.svg';
import './styles.css';

export default function Login() {
    const history = useHistory();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { signIn } = useContext(AuthContext);
    const [error, setError] = useState('');
    //const [showPassword, setShowPassword] = useState(false);

    async function handleSignIn(e: FormEvent) {
        e.preventDefault();
        const response = await signIn(email, password, rememberMe);
        if (response)
            history.push('/home');
        else
            setError('Invalid login');
    }

    function handleDisabledButton() {
        if (email.length !== 0 && password.length !== 0) {
            return false;
        }
        return true;
    }
    
    useEffect(() => {
        setError('');
    }, [email, password])

    return (
        <div id="login-page">
            <div id="login-page-content">
                <div id="login-bg-container">
                    <div id="login-bg-items-container">
                        <div>
                            <img src={logoImg} alt="Proffy"/>
                            <h2>Your online platform <br /> to study.</h2>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSignIn} id="login-form">
                    <fieldset>
                        <h1>Sign In</h1>
                        <span><strong>{error}</strong></span>
                        <div className="input-block" id="Email">
                            <label htmlFor="Email-input" id={Boolean(email) ? "active" : ""}>Email</label>
                            <input type="email" className={Boolean(error) ? "input-error" : ""} id="Email-input" onChange={(e) => { setEmail(e.target.value) }} />
                        </div>
                        <div className="input-block" id="Password">
                            <label htmlFor="Password-input" id={Boolean(password) ? "active" : ""}>Password</label>
                            <input type="password" className={Boolean(error) ? "input-error" : ""} id="Password-input" onChange={(e) => { setPassword(e.target.value) }} />
                        </div>
                        <div id="login-bottom">
                            <div>
                                <input id="remember_me" name='remember_me' type='checkbox' onChange={(e) => { setRememberMe(e.target.checked) }} />
                                <span id="remember-me" />
                                <label htmlFor="remember_me"> Remember me</label>
                            </div>

                            <Link id="forgot-password" to="/forgot-password">Forgot my password</Link>
                        </div>
                        <button type="submit" disabled={handleDisabledButton()} onClick={handleSignIn}>
                            Enter
                        </button>
                    </fieldset>
                    <footer>
                        <p>
                            Not registered yet? <br />
                            <Link to="/register">Register</Link>
                        </p>
                        <p id="footer-right-content">
                            It's free <img src={heartIcon} alt="Heart" />
                        </p>
                    </footer>
                </form>
            </div>
        </div>
    );
}