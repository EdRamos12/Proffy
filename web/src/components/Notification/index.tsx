import React, { useEffect, useState } from 'react';
import './styles.css';

interface NotificationProps {
    message: String;
    title: String;
    type: String;
    id: String;
    dispatch: any;
}

const NotificationComponent: React.FC<NotificationProps> = (props) => {
    const [exit, setExit] = useState(false);
    const [width, setWidth] = useState(0 as any);
    const [intervalID, setIntervalID] = useState(null as any);

    function handleStartTimer() {
        const interval = setInterval(() => {
            setWidth((prev: number) => {
                if (prev < 100) {
                    return prev + .5;
                }
                clearInterval(interval);
                return prev;
            });
        }, 20);
        setIntervalID(interval);
    }

    function handlePauseTimer() {
        clearInterval(intervalID);
    }

    function handleClose() {
        handlePauseTimer();
        setExit(true);
        setTimeout(() => {
            props.dispatch({
                type: "REMOVE_NOTIFICATION",
                id: props.id
            })
        }, 400)
    }

    useEffect(() => {
        handleStartTimer();
    }, []);

    useEffect(() => {
        if (width === 100) {
            handleClose();
        }
    }, [width])

    return (
        <div onMouseEnter={handlePauseTimer} onMouseLeave={handleStartTimer} className={`notification ${props.type === 'SUCCESS' ? 'success' : 'error' } ${exit ? "exit" : ""}` }>
            <h1>{props.title}</h1>
            <p>{props.message}</p>
            <div className="bar" style={{width: `${width}%`}}></div>
        </div>
    );
}

export default NotificationComponent;