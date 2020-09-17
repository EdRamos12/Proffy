import React from 'react';
import { useHistory } from 'react-router-dom';
import './styles.css'
import logoIcon from '../../assets/images/logo.svg'
import backIcon from '../../assets/images/icons/back.svg'

interface PageHeaderProps {
    title?: string;
    description?: string;
    page?: string;
    background?: string;
    icon?: string;
    info?: string;
}

const PageHeader: React.FC<PageHeaderProps> = (props) => {
    const history = useHistory();

    return (
        <header className="page-header" style={{backgroundImage: `url(${props.background})`}}>
            <div className="top-bar-container">
                <div className="top-bar-content">
                    <div>
                        <img onClick={history.goBack} src={backIcon} alt="go back" />
                    </div>
                    {props.page}
                    <img onClick={() => history.push('/home')} src={logoIcon} alt="ye" />
                </div>
            </div>
            <div className="header-content">
                <div className={ Boolean(props.title) ? "header-container" : "not-show" }>
                    <div className={ Boolean(props.title) ? "title-container" : "not-show" }>
                        <strong>{props.title}</strong>
                        { props.description && <p>{ props.description }</p> }
                    </div>
                    <div className={ Boolean(props.info) ? "info-container" : "not-show" }>
                        { props.icon && <img src={props.icon} alt=""/> }
                        <p>
                            { props.info }
                        </p>
                    </div>
                </div>
                {props.children}
            </div>
        </header>
    );
}

export default PageHeader;