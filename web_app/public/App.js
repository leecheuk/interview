import Nav from './Nav';
const { Link } = ReactRouterDOM;
const { useState, useEffect } = React;
import Speed from './speed';

const App = () => {
    useEffect(() => {
        getStats();
    }, []);
    const [stats, setStats] = useState({
        sample_size: 0,
        effective_bandwidth: 0,
        throughput: 0,
        bottleneck: 0,
        dataset: []
    });
    const getStats = () => {
        fetch('/api/stats?q=client')
            .then(res => res.json())
            .then((res) => {
                let d = res.data;
                setStats({
                    sample_size: d.dataset.length,
                    effective_bandwidth: new Speed(d.effective_bandwidth),
                    throughput: new Speed(d.throughput),
                    bottleneck: new Speed(d.bottleneck),
                    dataset: d.dataset
                });     
            });
    }
    const renderChart = () => {
        // initialization
        let margin = { top: 50, right: 50, bottom: 50, left: 50 };
        let width = 500;
        let height = 300;
        // use index
        let n = stats.dataset.length;
        // (domain, range) = (x, y)
        // Scale for x-axis
        let xScale = d3.scaleLinear().domain([0, n - 1]).range([0, width]);
        // Scale for y-axis; map the min, max of speed to height on chart; the mapping to y is inverse
        let yScale = d3.scaleLinear()
            .domain([stats.bottleneck.value, stats.effective_bandwidth.value]).range([height, 0]); 
        // create smooth line; use scale functions to transform values
        let line = d3.line().x((d, i) => xScale(i)).y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);
        // transform data
        let dataset = stats.dataset.map((d) => ({y: d}));
        
        // add SVG to page
        let svg = d3.select(".chart").append("svg")
            .attr("width", width + margin.left + margin.bottom)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // x-axis
        // axisBottom creates an axis
        svg.append("g").attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        // y-axis
        svg.append("g").attr("class", "y-axis")
            .call(d3.axisLeft(yScale));

        // add path, bind data and calls line generator
        svg.append("path").datum(dataset).attr("class", "line").attr("d", line);

        // add circle for each point; and enter data
        svg.selectAll(".dot").data(dataset).enter().append("circle")
            .attr("class", "dot").attr("cx", (d, i) => xScale(i))
            .attr("cy", d => yScale(d.y)).attr("r", 5);
    }
    // D3 after mount
    useEffect(() => {
        d3.select(".chart").select("svg").remove();
        renderChart();
    }, [stats]);
    const [isTesting, setIsTesting] = useState(false);
    const [transmissionRate, setTransmissionRate] = useState(null);
    const handleClickTest = () => {
        // a rough estimate of download speed
        let startTime = Date.now();
        let endTime = null;
        let size = 0;
        setIsTesting(true);
        fetch('/api').then(response => {
                let res = response.json();
                endTime = Date.now();
                size = parseInt(response.headers.get('Content-Length'));
                let time = (endTime - startTime) / 1000;
                let TR = size / time;
                console.log(endTime, startTime, time, size, TR)
                setTransmissionRate(TR);
                postTest(TR);
            });
    }
    const postTest = (TR) => {
        fetch('/api/test', {
            method: 'POST',
            body: JSON.stringify({
                val: TR
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(res => {
            getStats();
            setIsTesting(false);
        });
    }

    return (
        <div>
            <Nav />
            <h1>Download</h1>
            <button onClick={handleClickTest}>{!isTesting ? "Test" : "Testing"} download speed</button>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Sample size</td>
                        <td>{stats.sample_size} tests</td>
                    </tr>
                    <tr>
                        <td>Effective bandwidth</td>
                        <td>{(stats.effective_bandwidth).toString()}</td>
                    </tr>
                    <tr>
                        <td>Throughput</td>
                        <td>{(stats.throughput).toString()}</td>
                    </tr>
                    <tr>
                        <td>Bottleneck</td>
                        <td>{(stats.bottleneck).toString()}</td>
                    </tr>
                </tbody>
            </table>
            <div className="chart">

            </div>
        </div>
    )
}


export default App;