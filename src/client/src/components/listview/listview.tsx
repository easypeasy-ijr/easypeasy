import React from 'react';

interface ListviewProps {
    items: JSX.Element[];
}

interface ListviewState {
    //
}

export class Listview extends React.Component<ListviewProps, ListviewState> {
    public render() {
        if (this.props.items.length < 1) {
            return <div>There is no items!</div>;
        } else {
            return <ul className="list-view">
                {this.props.items.map(function (item, itemIndex) {
                    return <li key={itemIndex}>{item}</li>;
                })}
            </ul>;
        }
    }
}
