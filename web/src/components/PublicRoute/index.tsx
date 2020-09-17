import React, { useState, useEffect, useContext, useCallback } from 'react';

import { Route, Redirect } from 'react-router-dom';
import PageHeader from '../PageHeader';
import AuthContext from '../../contexts/AuthContext';

const PublicRoute: React.FC<any> = ({ component: Component, ...rest }) => {
    const { authenticated, loading, verifyAuthentication } = useContext(AuthContext);
    const [currentAuth, setCurrentAuth] = useState(authenticated);
    const [currentLoad, setCurrentLoad] = useState(loading);

    const verify = useCallback(async () => {
        if (currentLoad) if (!currentAuth) {
            const result = await verifyAuthentication().then(bool => {
                //console.log(Boolean(bool))
                return Boolean(bool);// returns true/false
            }).catch(error => {
                return false;
            });
            setCurrentLoad(false);
            setCurrentAuth(result);
            return result;
        } else {
            return currentAuth;
        }
    }, [verifyAuthentication, currentLoad, currentAuth]);

    useEffect(() => {
        let mounted = true;
        if (mounted) verify();
        return () => {mounted = false}
    }, [verifyAuthentication, verify]);

    return (
        <Route {...rest} render={(props) =>
            currentAuth ? (
                <Redirect
                    to={{
                        pathname: '/home',
                        state: { message: 'User logged in' }
                    }}
                />
            ) : currentLoad ? (
                <div id="page-teacher-form" className="container"><PageHeader title=" " description=" " /></div>
            ) : (
                        <Component {...props} />
                    )}
        />
    );
}

export { PublicRoute };