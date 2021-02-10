import React, { useContext, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import api from '../../services/api';
import { v4 } from 'uuid';
import NotificationContext from '../../contexts/NotificationContext';


export default function Confirm() {
    const { token } = useParams() as any;
    const history = useHistory();
    const dispatch = useContext(NotificationContext);

    useEffect(() => {
        (async () => {
            try {
                await api.get('/confirmation/'+token);
                dispatch({
                    type: "ADD_NOTIFICATION",
                    payload: {
                        type: 'SUCCESS',
                        message: 'You can now log in to the platform.',
                        title: 'E-mail confirmed!',
                        id: v4(),
                    }
                });
            } catch (error) {
                dispatch({
                    type: "ADD_NOTIFICATION",
                    payload: {
                        type: 'ERROR',
                        message: "Token validation for confirming e-mail went wrong. Please generate a new one by re-creating your account.",
                        title: 'Something went wrong.',
                        id: v4(),
                    }
                });
            }
            history.push('/');
        })();
    }, [token, history])

    return (
        <div></div>
    );
}