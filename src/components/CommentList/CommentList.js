import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '/home/david/env3.5/hello_react/node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './CommentList.css';
import { Comment } from '../';
import { Brush, ReferenceLine, RadialBarChart, RadialBar, BarChart, Bar, LineChart, Line, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, label } from 'recharts';

const CommentList = ( { comments, real } ) => {

    // const alertd = {alert}.alert
    // var upper = []
    // var down = []
    if (real){
        console.log(real.length);
        // console.log(real.slice(0, 20));
        // console.log(real.slice(20, 40));
        //
        // upper = real.slice(0, 20)
        // down = real.slice(20, 40)
    }


    const data = [
        {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
        {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
        {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
        {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
        {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
        {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
        {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
    ];

    const data2 = [
        { subject: 'Math', A: 120, B: 110, fullMark: 150 },
        { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
        { subject: 'English', A: 86, B: 130, fullMark: 150 },
        { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
        { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
        { subject: 'History', A: 65, B: 85, fullMark: 150 },
    ];

    const data01 = [{name: 'Group A', value: 400}, {name: 'Group B', value: 300},
        {name: 'Group C', value: 300}, {name: 'Group D', value: 200}];

    const data02 = [{name: 'A1', value: 100},
        {name: 'A2', value: 300},
        {name: 'B1', value: 100},
        {name: 'B2', value: 80},
        {name: 'B3', value: 40},
        {name: 'B4', value: 30},
        {name: 'B5', value: 50},
        {name: 'C1', value: 100},
        {name: 'C2', value: 200},
        {name: 'D1', value: 3000},
        {name: 'D2', value: 50}];

    // map data to components
    const commentList = comments.map(
        (comment, index) => (
            <Comment
                name={comment.email.split('@')[0]}
                body={comment.body}
                key={index}
            />
        )
    )

    const style = {
        top: 0,
        left: 350,
        lineHeight: '24px'
    };

    return (
        <div>

            <BarChart width={1500} height={600} data={real}
                      margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="rrname"/>
                <YAxis />
                <Tooltip />
                <Legend />
                <ReferenceLine y={0} stroke='#000'/>
                <Brush dataKey='rrname' height={30} stroke="#8884d8"/>
                <Bar dataKey="count(rrname)" fill="#8884d8" />
            </BarChart>

            <LineChart layout="vertical" width={1500} height={1000} data={real}
                       margin={{top: 20, right: 0, left: 100, bottom: 5}}>
                <Line type="monotone" dataKey="count(rrname)" stroke="#d884d8" />
                <XAxis type="number" />
                <YAxis dataKey="rrname" type="category"/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Legend />
            </LineChart>

            <LineChart width={1500} height={600} data={real}
                       margin={{top: 20, right: 0, left: 100, bottom: 5}}>
                <Line type="monotone" dataKey="count(rrname)" stroke="#d884d8" />
                <XAxis dataKey="rrname" type="category" />
                <YAxis type="number" />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip/>
                <Legend />
            </LineChart>

            <PieChart width={1500} height={600} margin={{top: 50, right: 0, left: 100, bottom: 5}}>
                <Pie isAnimationActive={false} data={data01} dataKey="value" cx={200} cy={200} outerRadius={140} fill="#8884d8"/>
                <Pie isAnimationActive={false} data={data02} dataKey="value" cx={200} cy={200} innerRadius={120} outerRadius={200} fill="#82ca9d" label />
            </PieChart>


            <ul className="CommentList">
                {commentList}
            </ul>

            <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={500} data={data2}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 150]}/>
                <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
                <Radar name="Lily" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6}/>
                <Legend />
            </RadarChart>

        </div>
    );
};


export default CommentList;