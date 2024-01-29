import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/user.provider";
import API from "../services/api.service";
import Highcharts from "highcharts/highstock";
import HighchartsReact from 'highcharts-react-official';

export default function StudentsProgress({ course, onGradeStart }) {

    const [user] = useContext(UserContext);
    const api = new API("grader");
    const chart = useRef();
    const [options, setOptions] = useState({
        chart:{
            height:"50%"
        },
        title:{
            text: "Content Coverage Progress"
        },
        series: [{
            type: "bar",
            name: "Requirement covered",
            data: []
        }]
    });

    useEffect(() => {
        api.get(`/studentprogress/${course.id}`, {
            Authorization: `Bearer ${user.token}`
        }).then(data => {
            console.log(chart.current);
            console.log(data);
            setOptions({
                xAxis: {
                    categories: data.map(s => s.display_name.split("@").shift().split(".").join(" "))
                },
                series: {
                    ...options.series,
                    name: `Requirement covered out of ${data[0].progress.requirement_count}`,
                    data: data.map(s => s.progress.requirement_completed_count)
                }
            });
        });
    }, []);

    return (<div>
        <HighchartsReact ref={chart}
            highcharts={Highcharts}
            allowChartUpdate={true}
            constructorType={'chart'}
            options={options}
        />
    </div>);
}