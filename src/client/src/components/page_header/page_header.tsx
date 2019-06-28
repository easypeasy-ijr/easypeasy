import * as React from "react";
import { Link } from "react-router-dom";
import { withAuth } from "../with_auth/with_auth";
import logo from './logo.png';


/**
 * Interface for User
 */
interface UserItem {
    id: number;
    email: string;
    password: string;
    contactName: string;
    companyName: string;

}

interface PageHeaderInternalProps {
    token: string | null;
}

interface PageHeaderInternalState {
    user: UserItem | null;
}

class PageHeaderInternal extends React.Component<PageHeaderInternalProps, PageHeaderInternalState> {
    public constructor(props: PageHeaderInternalProps) {
        super(props);
        this.state = {
            user: null,
        };
    }

    public componentWillUpdate() {
        (async () => {
            if (this.props.token && !this.state.user) {
                const user = await getUser(this.props.token) as UserItem;
                this.setState({ user: user });
            }
        })();
    }
    public render() {
        return [
            <div><Link className="left" to="/"><img className="icon" src={logo} alt="Logo"  ></img></Link></div>,
            <div className="top-navbar">
                <div className="container">
                    <Link className="left" to="/">Home</Link>
                    {this._renderLoginOrProfile()}
                    
                </div>
            </div>
        ];
    }
//<Link className="left" to="/help" >Help</Link> <Link className="left" to="/about" >About</Link>

    private _renderLoginOrProfile() {
        if (this.props.token && this.state.user) {
            return (
                <div>
                    <Link className="left" to="/neworder">New Order</Link>
                    <Link className="left" to="/favourites"> Favourites</Link>
                    <Link className="left" to="/accountsettings">Account Settings</Link>
                    <Link className="left" to="/suppliers">Suppliers</Link>
                    <div>
                        <Link className="btn right" to="/accountsettings">{this.state.user.companyName}</Link>
                    </div>
                </div>
            );
        } else {
            return <React.Fragment>
                <Link className="btn right" to="/login">Sign In</Link>
                <Link className="btn right" to="/register">Sign Up</Link>
            </React.Fragment>
        }
    }
}

export const PageHeader = withAuth(props => <PageHeaderInternal token={props.authToken} />)

/**
 * Get user info using token
 */
async function getUser(jwt: string) {
    return new Promise(function (resolve, reject) {
        (async () => {

            const response = await fetch(
                "/api/v1/auth/profile",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    }
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}