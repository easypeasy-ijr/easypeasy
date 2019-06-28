import * as React from "react";
import * as joi from "joi";
import { withRouter } from "react-router-dom";
import * as H from 'history';
import { setAuthToken } from "../components/with_auth/with_auth";

const credentialSchema = {
    email: joi.string().email().required(),
    password: joi.string().min(3).max(30).required()
};

interface LoginProps {
    history: H.History;
}

interface LoginState {
    email: string;
    password: string;
    error: string | null;
}

export class LoginInternal extends React.Component<LoginProps, LoginState> {
    public constructor(props: LoginProps) {
        super(props);
        this.state = {
            email: "",
            password: "",
            error: null
        };
    }

    /**
     * Before component is rendered logout current user
     */
    public componentWillMount() {
        setAuthToken(null);
    }

    public render() {
        return [<h1>
            Login
            </h1>,
        <div className= "login">
            <div >
                {this._renderServerErrors()}
                {this._renderValidationErrors()}
            </div>
            <div className = "smallFormInput">
                Email:
                <input
                    type="text"
                    placeholder="Email"
                    onKeyUp={(e) => this._updateEmail((e as any).target.value)}
                />
            </div>
            <div className = "smallFormInput">
                Password:
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => this._updatePassword((e as any).target.value)}
                />
            </div>
            <button className = "button_submit" onClick={() => this._handleSubmit()}>Login</button>
        </div>
        ];
    }
    private _renderServerErrors() {
        if (this.state.error === null) {
            return <div></div>;
        } else {
            return <div className = "error-msg">{this.state.error}</div>;
        }
    }
    // Display errors or OK on screen
    private _renderValidationErrors() {
        const validationResult = joi.validate({
            email: this.state.email,
            password: this.state.password
        }, credentialSchema);
        if (validationResult.error) {
            return <div className = "error-msg">
                {validationResult.error.details.map(d => <div>{d.message}</div>)}
            </div>;
        } else {
            return <div className = "success-msg" >OK!</div>;
        }
    }
    // Update the state (email) on keyup
    private _updateEmail(email: string) {
        this.setState({ email: email });
    }
    // Update the state (password) on keyup
    private _updatePassword(password: string) {
        this.setState({ password: password });
    }
    // Send HTTP request on click
    private _handleSubmit() {
        (async () => {
            try {
                const token = await getToken(this.state.email, this.state.password);
                // Reset error
                this.setState({ error: null });
                // Save token in window object
                // (window as any).__token = token;
                setAuthToken(token);
                // Redirect to home page
                this.props.history.push("/");
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }
}

// withRouter pass some props that contain the history to the
// <LoginInternal> component and returns a new component named
// <Login>
export const Login = withRouter(props => <LoginInternal {...props} />);

async function getToken(email: string, password: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const data = {
                email: email,
                password: password
            };
            const response = await fetch(
                "/api/v1/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json.token);
            } else {
                reject(json);
            }
        })();
    });
}