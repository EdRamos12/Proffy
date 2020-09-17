import React, { useState, useEffect, useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PageHeader from '../PageHeader';
import AuthContext from '../../contexts/AuthContext';

const PrivateRoute: React.FC<any> = ({ component: Component, ...rest }) => {
    const { authenticated, loading, verifyAuthentication } = useContext(AuthContext);
    const [currentAuth, setCurrentAuth] = useState(authenticated);
    const [currentLoad, setCurrentLoad] = useState(loading);

    useEffect(() => {
        const verify = () => {
            if (currentLoad) if (!currentAuth) {
                verifyAuthentication().then(bool => {
                    //console.log(Boolean(bool))
                    setCurrentAuth(Boolean(bool));// returns true/false
                    setCurrentLoad(false);
                }).catch(err => {
                    setCurrentAuth(false);
                    setCurrentLoad(false);
                });
            }
        }
    
        let mounted = true;
        if (mounted) {
            verify();
        }
        return () => { mounted = false }
    }, [currentAuth, currentLoad, verifyAuthentication]);

    return (
        <Route {...rest} render={(props) =>
            currentAuth ? (
                <Component {...props} />
            ) : currentLoad ? (
                <div id="page-teacher-form" className="container"><PageHeader title=" " description=" " /></div>
            ) : (
                <Redirect
                    to={{
                        pathname: '/',
                        state: { message: 'User not authorized' },
                    }}
                />
            )}
        />
    );
}

export { PrivateRoute };