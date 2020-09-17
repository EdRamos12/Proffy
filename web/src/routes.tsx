import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Landing from './pages/Landing';
import TeacherForm from './pages/TeacherForm';
import TeacherList from './pages/TeacherList';
import Login from './pages/Login';
import { PrivateRoute } from './components/PrivateRoute';
import Register from './pages/Register';
import { PublicRoute } from './components/PublicRoute';
import Profile from './pages/Profile';
import Forgot from './pages/Forgot';
import Confirm from './pages/Confirm';
import Reset from './pages/Reset';

export default function Routes() {
    return (
        <Switch>
            <PrivateRoute path="/home" exact component={Landing} />
            <PrivateRoute path="/study" exact component={TeacherList} />
            <PrivateRoute path="/give-classes" exact component={TeacherForm} />
            <PrivateRoute path="/profile/:id" component={Profile} />
            <PrivateRoute path="/profile" component={Profile} />
            <PublicRoute path="/register" exact component={Register} />
            <PublicRoute path="/forgot-password" exact component={Forgot} />
            <PublicRoute path="/confirm/:token" component={Confirm} />
            <PublicRoute path="/reset-password/:token" component={Reset} />
            <PublicRoute path="/" exact component={Login} />
            <Route path="/confirm" component={() => (
                <Redirect
                    to={{pathname: '/',}}
                />
            )} />
            <Route path="/reset-password" component={() => (
                <Redirect
                    to={{pathname: '/',}}
                />
            )} />
            <Route component={() => (<div><h1 style={{ fontSize: '15vw' }}>404</h1><h1 style={{ textAlign: 'center' }}>Page not found.</h1></div>)} />
        </Switch>
    )
}