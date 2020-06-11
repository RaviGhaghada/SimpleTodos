import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Mongo } from 'meteor/mongo'

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId }
            ]
        });
    });
}

Meteor.methods({
    'tasks.insert'(text) {
        check(text, String)

        // make sure user is logged in
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.insert({
            text,
            createdAt: new Date(), // current date
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
            dueLimit: 30
        });
    },

    'tasks.remove'(taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.remove(taskId);
    },

    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);

        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { checked: setChecked } });
    },

    'tasks.setPrivate'(taskId, setToPrivate) {
        check(taskId, String);
        check(setToPrivate, Boolean);

        const task = Tasks.findOne(taskId);
        if (task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { private: setToPrivate } });
    },

    /**
     * Set the due limit of a task 
     */
    'tasks.setDueLimit'(taskId, dueLimit) {
        check(taskId, String);
        check(dueLimit, Number);

        // ensure that only the owner can change it
        const task = Tasks.findOne(taskId);
        console.log(dueLimit)
        if (task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // ensure that the dueLimit doesn't go below 0
        dueLimit = (dueLimit < 0) ? 0 : dueLimit;

        Tasks.update(taskId, { $set: { dueLimit: dueLimit } });
    }
});