import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import moment from 'moment';
// Task component - represents a single todo item
export default class Task extends Component {

    constructor(props) {
        super(props);

        this.state = {
            expirytime: this.getExpiryTime()
        }

        // update the displayed minutes every 100 ms
        this.timer = setInterval(this.updateExpiryTime.bind(this), 100)
    }

    /**
     *  update the expiry label if the minutes left/due has changed
     */
    updateExpiryTime() {
        var expirytime = this.getExpiryTime()
        if (expirytime != this.state.expirytime) {
            this.setState({
                expirytime: expirytime
            });
        }
    }

    /**
     * Gets the number of minutes in which the task will expire
     */
    getExpiryTime() {
        var start = moment(this.props.task.createdAt)
        var end = moment()
        var expirytime = this.props.task.dueLimit - end.diff(start, "minutes")
        return expirytime
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    toggleChecked() {
        // Set the checked property to the opposite of its current value
        Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
    }
    deleteThisTask() {
        Meteor.call('tasks.remove', this.props.task._id);
    }

    togglePrivate() {
        Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
    }

    /**
     * Request the server to increment the due time limit of a task by 5 minutes
     */
    incrementDueLimit() {
        Meteor.call('tasks.setDueLimit', this.props.task._id, this.props.task.dueLimit + 5);
    }

    /**
     * Request the server to decrement the due time limit of a task by 5 minutes
     */
    decrementDueLimit() {
        Meteor.call('tasks.setDueLimit', this.props.task._id, this.props.task.dueLimit - 5);
    }

    render() {
        const taskClassName = classnames({
            checked: this.props.task.checked,
            private: this.props.task.private,
        });

        const isDue = this.state.expirytime <= 0;
        const dueClassName = isDue ? "due" : "undue"

        return (
            <li className={taskClassName}>
                <button className="delete" onClick={this.deleteThisTask.bind(this)}>&times;</button>

                <input type="checkbox" readOnly checked={!!this.props.task.checked} onClick={this.toggleChecked.bind(this)} />

                {this.props.showPrivateButton ?
                    <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
                        {this.props.task.private ? 'Private' : 'Public'}
                    </button> : ''
                }

                <span className="text">
                    <strong>{this.props.task.username}</strong>:{this.props.task.text}

                    =&gt; <span className={dueClassName}>
                        {!isDue ? this.state.expirytime + " minutes left" : 'due by ' + Math.abs(this.state.expirytime) + ' minutes'}
                    </span>

                    <div className="due-buttons">
                        <button onClick={this.incrementDueLimit.bind(this)}>+</button>
                        <button onClick={this.decrementDueLimit.bind(this)}>-</button>
                    </div>
                </span>
            </li>
        );
    }
}