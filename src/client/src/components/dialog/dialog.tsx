import * as React from "react";
import { withRouter, match } from "react-router";
import { Link } from "react-router-dom";
import plus from './plus.png';





interface DialogProps {
    title: String;
    body: JSX.Element;
    submit: JSX.Element;
    cancel: JSX.Element;
}

interface DialogState {
}

export class Dialog extends React.Component<DialogProps, DialogState> {
    public constructor(props: DialogProps) {
        super(props);
    }

    public render() {

        if (this.props.title === null) {
            return <div >Loading...</div>;
        } else {
            return <div className="dialog_box">
                <div className="dialog_title">{this.props.title}</div>
                <div className="dialog_content">{this.props.body}</div>
                <div className="dialog_cancel_button">{this.props.cancel}</div>
                <div className="dialog_submit_button">{this.props.submit}</div>

            </div>

        }
    }
}