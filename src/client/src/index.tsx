import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Login } from './pages/login';
import { PageHeader } from "./components/page_header/page_header";
import { Home } from './pages/home';
import { Register } from './pages/register';
import { NewOrder } from './pages/neworder';
import { ConfirmOrder } from './pages/confirmorder';
import { SuppliersPage } from './pages/supplierspage';
import { Favourites } from './pages/favourites';
import { AccountSettings } from './pages/accountsettings';
import { OrderDetails } from './pages/orderdetails';

ReactDOM.render(
    // This is the router component
    <BrowserRouter>
        {
            /*
                This is how you do a comment in JSX!
            */
        }
        <div>
            <PageHeader />
            {
                /*
                    The Switch component will render one of the components
                    The rendered component will be the one in the Route with
                    the matching path
                */
            }
            <div className="container">
            
                <Switch>
                    {
                        /*
                            The Route component can be used to declare the 
                            pages in our single page web application
                        */
                    }
                    <Route exact path="/" component={Home} />
                    <Route exact path="/neworder" component={NewOrder} />
                    <Route exact path="/neworder/:id" component={NewOrder} />
                    <Route exact path="/confirmorder/:id" component={ConfirmOrder} />
                    <Route exact path="/suppliers" component={SuppliersPage} />
                    <Route exact path="/favourites" component={Favourites} />
                    <Route exact path="/accountsettings" component={AccountSettings} />
                    <Route exact path="/orderdetails/:id" component={OrderDetails} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/register" component={Register} />
                </Switch>
            </div>
        </div>
    </BrowserRouter>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
