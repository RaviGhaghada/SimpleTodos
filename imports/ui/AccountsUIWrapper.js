import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

export default class AccountsUIWrapper extends Component {
    componentDidMount() {
        // use blaze to render buttons
        this.view = Blaze.render(Template.loginButtons,
            ReactDOM.findDOMNode(this.refs.container))
    }

    componentWillUnmount() {
        // cleanup blaze view
        Blaze.remove(this.view)
    }

    render() {
        // placeholder container to be filled in
        return <span ref="container" />
    }
}