import * as React from "react";
import * as joi from "joi";
import { withRouter } from "react-router-dom";
import * as H from 'history';


/**
 * validation schema for emails
 */
const credentialSchema = {
    email: joi.string().email().required(),
    email2: joi.any().valid(joi.ref('email')).required().options({ language: { any: { allowOnly: 'must match email' } } }).label('Email Confirmation'),
    password: joi.string().min(3).max(30).required(),
    password2: joi.any().valid(joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Password Confirmation'),
    companyName: joi.string().required(),
    contactName: joi.string().required()
};

interface RegisterProps {
    history: H.History;
}

interface RegisterState {
    contactName: string;
    companyName: string;
    email: string;
    email2: string;
    password: string;
    password2: string;
    error: string | null;
}

export class RegisterInternal extends React.Component<RegisterProps, RegisterState> {
    public constructor(props: RegisterProps) {
        super(props);
        this.state = {
            contactName: "",
            companyName: "",
            email: "",
            email2: "",
            password: "",
            password2: "",
            error: null
        };
    }

    /**
     * Render register form
     */
    public render() {
        return [<h1>
            Register
            </h1>,
        <div className= "register">
            <div>
                {this._renderServerErrors()}
                {this._renderValidationErrors()}
            </div>
            <div className = "largeFormInput">
                Company Name:
                <input
                    type="text"
                    placeholder="Company Name"
                    onKeyUp={(e) => this._updateCompanyName((e as any).target.value)}
                />
            </div>
            <div className = "largeFormInput">
                Contact Name:
                <input
                    type="text"
                    placeholder="Contact Name"
                    onKeyUp={(e) => this._updateContactName((e as any).target.value)}
                />
            </div>
            <div className = "largeFormInput">
                Email Address:       
                <input
                    type="text"
                    placeholder="Email"
                    onKeyUp={(e) => this._updateEmail((e as any).target.value)}
                />
            </div>
            <div className = "largeFormInput">
                Repeat Email:
                <input
                    type="text"
                    placeholder="Repeat Email"
                    onKeyUp={(e) => this._updateEmail2((e as any).target.value)}
                />
            </div>
            <div className = "largeFormInput">
                Password:
                <input
                    type="password"
                    placeholder="Password"
                    onKeyUp={(e) => this._updatePassword((e as any).target.value)}
                />
            </div>
            <div className = "largeFormInput">
                Repeat Password:
                <input
                    type="password"
                    placeholder="Repeat Password"
                    onKeyUp={(e) => this._updatePassword2((e as any).target.value)}
                />
            </div>
            <button className = "button_submit_large" onClick={() => this._handleSubmit()}>Register</button>
        </div>
        ];
    }

    /**
     * Show Validation errors
     */
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
            email2: this.state.email2,
            password: this.state.password,
            password2: this.state.password2,
            companyName: this.state.companyName,
            contactName: this.state.contactName
        }, credentialSchema);
        if (validationResult.error) {
            return <div className = "error-msg">
                {validationResult.error.details.map(d => <div>{d.message}</div>)}
            </div>;
        } else {
            return <div className = "success-msg">OK!</div>;
        }
    }

    // Update the state (companyName) on keyup
    private _updateCompanyName(name: string) {
        this.setState({ companyName: name });
    }
    // Update the state (contactName) on keyup
    private _updateContactName(name: string) {
        this.setState({ contactName: name });
    }
    // Update the state (email) on keyup
    private _updateEmail(email: string) {
        this.setState({ email: email });
    }
    // Update the state (email2) on keyup
    private _updateEmail2(email: string) {
        this.setState({ email2: email });
    }
    // Update the state (password) on keyup
    private _updatePassword(password: string) {
        this.setState({ password: password });
    }
    // Update the state (password2) on keyup
    private _updatePassword2(password: string) {
        this.setState({ password2: password });
    }
    // Send HTTP request on click
    private _handleSubmit() {
        (async () => {
            try {
                const user = await createUser(this.state.companyName, this.state.contactName, 
                    this.state.email, this.state.password);
                // Reset error
                this.setState({ error: null });
                // Redirect to home page
                this.props.history.push("/");
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }
}

// withRouter pass some props that contain the history to the
// <RegisterInternal> component and returns a new component named
// <Register>
export const Register = withRouter(props => <RegisterInternal {...props} />);

/**
 * Create user request
 */
async function createUser(companyName: string, contactName: string, email: string, password: string) {
    return new Promise(function (resolve, reject) {
        (async () => {
            const data = {
                companyName: companyName,
                contactName: contactName,
                email: email,
                password: password
            };
            const response = await fetch(
                "/api/v1/users",
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