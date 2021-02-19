import React from 'react';
import './styles.css';
import { Link } from 'react-router-dom';
import checkIcon from '../../assets/images/icons/feito.svg';

interface SuccessProps {
    title: string;
    button_text: string;
    success?: boolean;
}

const SuccessContainer: React.FC<SuccessProps> = ({ title, button_text, success, children }) => {
    console.log(success);
    return (
        <>
            {success && <div id={'register-success'}>
                <div id="success-content">
                    <img src={checkIcon} alt="Feito" />
                    <div>
                        <h1>{title}</h1>
                        <p>
                            {children}
                        </p>
                    </div>
                    <Link to="/">{button_text}</Link>
                </div>
            </div>}
        </>
    );
}

export default SuccessContainer;