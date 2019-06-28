import React from 'react';

/**
 * JSX Component
 */
interface BodyProps {
    content: JSX.Element
    
}
interface BodyState {
    //
}
/**
 * Page Body Component
 */
export class Body extends React.Component<BodyProps, BodyState> {

    public render() {
        return (
                <div className = "body">
                {this.props.content}
                </div>
        );
    }
}

