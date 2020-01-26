import Nav from './Nav';
const {Link} = ReactRouterDOM;
import Speed from './speed';

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
                    effective_bandwidth: new Speed(d.effective_bandwidth),
                    throughput: new Speed(d.throughput),
                    bottleneck: new Speed(d.bottleneck),
                    dataset: new Speed(d.dataset)
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
<<<<<<< HEAD
=======
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
            <p>
                When compare the values, you should find a benchmark for reference. 
                The benchmark can be your required bandwidth, so you need average usage 
                by server services, 
                network bandwidth available to your server as well as the maximum number
                of potential users for estimation. 
            </p>
>>>>>>> develop
        </div>
    )
}


export default Admin;