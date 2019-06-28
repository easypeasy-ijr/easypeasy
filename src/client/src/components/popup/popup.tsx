import * as React from "react";
import { withRouter, match } from "react-router";
import { Link } from "react-router-dom";
import plus from './plus.png';

interface PopUpProps {
    title: String;
    message: String;
    close: JSX.Element;
}

interface PopUpState {
}

export class PopUp extends React.Component<PopUpProps, PopUpState> {
    public constructor(props: PopUpProps) {
        super(props);
        this.state = {
            
        };
    }

    public render() {

        if (this.props.title === null) {
            return <div >Loading...</div>;
        } else {
            return <div className="popup_box">
            <label className="popup_title">{this.props.title}</label>
            <div className="popup_content"><div className="popup_content_message">{this.props.message}</div></div>
            <button className="popup_ok_button">{this.props.close}</button>
        </div>

        }
    }
}