/* eslint-disable no-undef */
import {
  useHistory,
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import PageAuthorization from '../pages/pageAuthorization';
import PageChat from '../pages/pageChat';

export const NotFound = () => <div className="Error">404</div>;

export const Content = () => {
  const history = useHistory();
  return (
    <>
      <Provider store={store}>
        <Router history={history}>
          {localStorage.authToken ? (
            <Redirect from="/" to="/chat" />
          ) : (
            <Redirect from="/" to="/auth" />
          )}
          <main>
            <Switch>
              <Route path="/auth" render={() => <PageAuthorization />} exact />
              <Route path="/chat" render={() => <PageChat />} exact />
              <Route component={NotFound} />
            </Switch>
          </main>
        </Router>
      </Provider>
    </>
  );
};
