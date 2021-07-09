import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  Link,
} from "react-router-dom";
import createBrowserHistory from "../history";
import { Provider } from "react-redux";
import { store } from "../store";
import { PageAuthorization } from "../pages/pageAuthorization";
import  SignIn from "../pages/newPageAutorixation"
import PageChat  from "../pages/pageChat";

export const NotFound = () => <div className="Error">404</div>;

export const history = createBrowserHistory();



export const Content = () => {
  
  return (
    <>
      <Provider store={store}>
        <Router history={history}>
        {/* {localStorage.authToken ? <Redirect from="/" to="/chat" />:<Redirect from="/" to="/auth" />} */}
          <main>
            <Switch>
            <Route path="/auth2"  render={() => < SignIn/>} exact />
              <Route path="/auth"  render={() => <PageAuthorization/>} exact />
              <Route path="/chat" render={() => <PageChat/>} exact/>
            </Switch>
          </main>
        </Router>
      </Provider>
    </>
  );
};
