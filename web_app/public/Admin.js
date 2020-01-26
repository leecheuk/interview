import Nav from './Nav';
const {Link} = ReactRouterDOM;

const Admin = () => {
    const [stats, setStats] = React.useState({
        sample_size: 0,
        effective_bandwidth: 0,
        throughput: 0,
        bottleneck: 0,
        dataset: []
    });
    const getStats = () => {
        fetch('/api/stats')
            .then(res => res.json())
            .then((res) => {
                let d = res.data;
                setStats({
                    sample_size: d.dataset.length,
                    effective_bandwidth: d.effective_bandwidth,
                    throughput: d.throughput,
                    bottleneck: d.bottleneck,
                    dataset: d.dataset
                })
            });
    }
    React.useEffect(() => {
        getStats();
    }, []);
    const [isTesting, setIsTesting] = React.useState(false);
    const handleClickTest = () => {
        setIsTesting(true);
        fetch('/api').then(res => {
            setTimeout(() => {
                setIsTesting(false);
                getStats();
            }, 5000);
        });
    };
    return (
        <div>
            <Nav />
            <h1>Admin Dashboard</h1>
            <button onClick={handleClickTest}>{!isTesting ? "Test" : "Testing"} server speed</button>
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
                        <td>{(stats.sample_size).toFixed(2)} bytes/s</td>
                    </tr>
                    <tr>
                        <td>Effective bandwidth</td>
                        <td>{(stats.effective_bandwidth).toFixed(2)} bytes/s</td>
                    </tr>
                    <tr>
                        <td>Throughput</td>
                        <td>{(stats.throughput).toFixed(2)} bytes/s</td>
                    </tr>
                    <tr>
                        <td>Bottleneck</td>
                        <td>{(stats.bottleneck).toFixed(2)} bytes/s</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}


export default Admin;