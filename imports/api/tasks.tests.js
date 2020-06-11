import { Meteor } from 'meteor/meteor';

import { Random } from 'meteor/random';

import { Tasks } from './tasks';
import { assert } from 'chai';

if (Meteor.isServer) {
    describe('Tasks', () => {
        const userId = Random.id();
        let taskId;

        describe('Tests for delete method', () => {

            describe('on public tasks', () => {
                beforeEach(() => {
                    Tasks.remove({});
                    taskId = Tasks.insert({
                        text: 'test task',
                        createdAt: new Date(),
                        owner: userId,
                        username: 'raviravi',
                        dueLimit: 30,
                        private: false,
                        checked: false
                    });
                });

                it('can delete a public task as a non-owner but logged in', () => {
                    const deleteTask = Meteor.server.method_handlers['tasks.remove'];

                    var otherUserId = Random.id()
                    // ensure that the random id isn't the same as the creator
                    while (otherUserId == userId) {
                        otherUserId = Random.id()
                    }
                    const invocation = { otherUserId }
                    deleteTask.apply(invocation, [taskId]);
                    assert(Tasks.find().count() == 0);
                });

                it('can delete a public task as a owner', () => {
                    const deleteTask = Meteor.server.method_handlers['tasks.remove'];
                    const invocation = { userId }
                    deleteTask.apply(invocation, [taskId]);
                    assert(Tasks.find().count() == 0);
                });
                it('can delete a public task while logged out', () => {
                    const deleteTask = Meteor.server.method_handlers['tasks.remove'];
                    const invocation = {}
                    deleteTask.apply(invocation, [taskId]);
                    assert(Tasks.find().count() == 0);
                });
            });

            describe('on private task', () => {
                beforeEach(() => {
                    Tasks.remove({});
                    taskId = Tasks.insert({
                        text: 'test task',
                        createdAt: new Date(),
                        owner: userId,
                        username: 'raviravi',
                        dueLimit: 30,
                        private: true,
                        checked: false
                    });
                });

                it('cannot delete a private task as a non-owner but logged in', () => {
                    const deleteTask = Meteor.server.method_handlers['tasks.remove'];

                    var otherUserId = Random.id()
                    // ensure that the random id isn't the same as the creator
                    while (otherUserId == userId) {
                        otherUserId = Random.id()
                    }
                    const invocation = { otherUserId }
                    try {
                        deleteTask.apply(invocation, [taskId]);
                        assert(false, "Expected auth error to be thrown");
                    } catch (err) {
                        assert(err.message == '[not-authorized]');
                    }
                });

                it('can delete a private task as a owner', () => {
                    const deleteTask = Meteor.server.method_handlers['tasks.remove'];
                    const invocation = { userId }
                    deleteTask.apply(invocation, [taskId]);
                    assert(Tasks.find().count() == 0);
                });
                it('cannot delete a private task while logged out', () => {
                    const deleteTask = Meteor.server.method_handlers['tasks.remove'];
                    const invocation = {}
                    try {
                        deleteTask.apply(invocation, [taskId]);
                        assert(false, "Expected auth error to be thrown");
                    } catch (err) {
                        assert(err.message == '[not-authorized]');
                    }
                });
            });
        });
        describe('Tests for set due limit method', () => {
            beforeEach(() => {
                Tasks.remove({});
                taskId = Tasks.insert({
                    text: 'test task',
                    createdAt: new Date(),
                    owner: userId,
                    username: 'raviravi',
                    dueLimit: 30,
                    private: false,
                    checked: false
                });
            });

            it('should fail to set the due limit while logged out', () => {
                const setDueLimitOfTask = Meteor.server.method_handlers['tasks.setDueLimit'];

                // not logged in, no id
                const invocation = {}
                try {
                    setDueLimitOfTask.apply(invocation, [taskId, 35]);
                    assert(false, "Expected auth error to be thrown");
                } catch (err) {
                    assert(err.message == '[not-authorized]');
                }
            });
            it('should fail to set the due limit while logged in as a non-owner', () => {
                const setDueLimitOfTask = Meteor.server.method_handlers['tasks.setDueLimit'];

                var otherUserId = Random.id()
                // ensure that the random id isn't the same as the creator
                while (otherUserId == userId) {
                    otherUserId = Random.id()
                }
                const invocation = { otherUserId }
                try {
                    setDueLimitOfTask.apply(invocation, [taskId, 35]);
                    assert(false, "Expected auth error to be thrown");
                } catch (err) {
                    assert(err.message == '[not-authorized]');
                }

            });
            it('should successfully set while logged in with a positive new due limit', () => {
                const setDueLimitOfTask = Meteor.server.method_handlers['tasks.setDueLimit'];

                const invocation = { userId }
                const randomPositive = 1 + Random.fraction() * 10
                setDueLimitOfTask.apply(invocation, [taskId, randomPositive]);
                assert(Tasks.findOne(taskId).dueLimit == randomPositive);
            });
            it('should set the due limit to 0 if the owner attempts to set it to a value below 0', () => {
                const setDueLimitOfTask = Meteor.server.method_handlers['tasks.setDueLimit'];

                const invocation = { userId };
                const randomNegative = -1 * (1 + Random.fraction() * 10);
                setDueLimitOfTask.apply(invocation, [taskId, randomNegative]);
                assert(Tasks.findOne(taskId).dueLimit == 0);
            });
        });
    });
}