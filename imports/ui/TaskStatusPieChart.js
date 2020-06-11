import { Pie } from 'react-chartjs-2';
import React, { Component } from 'react';

export default class TaskStatusPieChart extends Component {

    constructor(props) {
        super(props)
    }


    render() {
        console.log(this.props.complete);
        console.log(this.props.open);

        return (<Pie data={{
            labels: ['Completed', 'Open'],
            datasets: [
                {
                    label: 'Tasks',
                    backgroundColor: [
                        'blue',
                        'red',
                    ],
                    data: [this.props.complete, this.props.open]
                }
            ]
        }} options={{
            title: {
                display: true,
                text: 'Tasks open vs completed',
                fontSize: 30
            },
            legend: {
                display: true,
                position: 'bottom'
            }
        }} />)
    }
}