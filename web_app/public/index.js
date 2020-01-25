import App from './App.js';
import Admin from './Admin.js';
const ReactRouter = ReactRouterDOM;
const {BrowserRouter, Route, Switch} = ReactRouter;

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route exact path="/">
                <App />
            </Route>
            <Route exact path="/admin">
                <Admin />
            </Route>
        </Switch>
    </BrowserRouter>, 
    document.getElementById('root')
);
