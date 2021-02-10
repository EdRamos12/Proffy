import React, { createContext, useReducer, useState } from 'react';
import { v4 } from 'uuid';
import NotificationComponent from '../components/Notification';

const NotificationContext = createContext({} as any);

export const NotificationProvider: React.FC = (props) => {
    const [state, dispatch] = useReducer((state: any, action: { id?: any, type: any; payload: any; }) => { 
        switch (action.type) {
            case 'ADD_NOTIFICATION':
                return [...state, {...action.payload}];
            case 'REMOVE_NOTIFICATION':
                return state.filter((el: any) => el.id !== action.id);
            default:
                return state;
        }
    }, []);

    // dispatch({
    //     type: "ADD_NOTIFICATION",
    //     payload: {
    //         type: 'SUCCESS',
    //         message: 'Testing3',
    //         title: 'Successful test!!!',
    //         id: v4(),
    //     }
    // });

    return (
        <NotificationContext.Provider value={dispatch}>
            <div className="notification-wrapper">
                {state.map((note: any) => {
                    return <NotificationComponent dispatch={dispatch} key={note.id} {...note} />
                })}
            </div>
            {props.children}
        </NotificationContext.Provider>
    )
};

export default NotificationContext;