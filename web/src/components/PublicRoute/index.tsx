import React, { useState, useEffect, useContext, useCallback } from 'react';

import { Route, Redirect } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import NotificationContext from '../../contexts/NotificationContext';
import { v4 } from 'uuid';
import LoadingScreen from '../../pages/LoadingPublic';

const PublicRoute: React.FC<any> = ({ component: Component, ...rest }) => {
    const { authenticated, loading, verifyAuthentication } = useContext(AuthContext);
    const [currentAuth, setCurrentAuth] = useState(authenticated);
    const [currentLoad, setCurrentLoad] = useState(loading);
    const dispatch = useContext(NotificationContext);

    const verify = useCallback(async () => {
        if (currentLoad) if (!currentAuth) {
            const result = await verifyAuthentication().then(bool => {
                //console.log(Boolean(bool))
                return Boolean(bool);// returns true/false
            }).catch(error => {
                if (error.response === undefined) {
                    dispatch({
                        type: "ADD_NOTIFICATION",
                        payload: {
                            type: 'ERROR',
                            message: "It appears that we can't connect to our server. Check if your internet connection is stable or check our social media to see any scheduled maintenance. ",
                            title: 'Something went wrong.',
                            id: v4(),
                        }
                    });
                }
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
                LoadingScreen()
            ) : (
                        <Component {...props} />
                    )}
        />
    );
}

export { PublicRoute };