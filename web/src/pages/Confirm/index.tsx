import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import api from '../../services/api';

export default function Confirm() {
    const { token } = useParams() as any;
    const history = useHistory();

    useEffect(() => {
        (async () => {
            try {
                await api.get('/confirmation/'+token);
                history.push('/#confirm=OK');
            } catch (error) {
                history.push('/#confirm=ERR');
            }
        })();
    }, [token, history])

    return (
        <div></div>
    );
}