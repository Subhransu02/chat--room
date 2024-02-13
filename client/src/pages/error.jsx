import React from 'react';
import { withRouter } from 'react-router-dom';
import messages from '../data/messages.json';

const ErrorPage = (props) => {
    return (
        <div>
            <h1>{messages.error} {props.code}</h1>
            <div className="mt-3">
                {props.children}
            </div>
        </div>
    );
}

export default withRouter(ErrorPage);