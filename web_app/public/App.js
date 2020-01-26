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
                    dataset: new Speed(d.dataset)
                })
            });
    }
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
        </div>
    )
}


export default App;