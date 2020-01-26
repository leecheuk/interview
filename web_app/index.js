const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const fs = require('fs');
const readline = require('readline');
const stream = require('stream');
const winston = require('winston');
const PORT = 3002;

// serve html in public
app.use(express.static(path.join(__dirname, 'public')));
// for parsing body 
app.use(bodyParser.json());
// middleware to set api version; we use custom headers to prevent breaking changes
// to other services that might consume this service
app.use("/api/*", (req, res, next) => {
    res.set('Api-Version', '1.0.0');
    next();
});

// create speed logs
const clientLogger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: './public/logs/log_client.log',
            label: 'transmission_rate'
        })
    ]
});
const serverLogger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
            filename: './public/logs/log_server.log',
            label: 'transmission_rate' 
        })
    ]
});




/**
 * Calculate transmission rate from server to client.
 * FORMULA:
 *        TR = size / time
 * 
 * Note, socket object here is an abstraction of TCP socket. 
 * We still need a better estimator of download speeds. Since we 
 * are using an API, we probably need to go lower language to 
 * understand how to capture the speed more accurrately.
 */
let queue = [0];
app.get("/api", (req, res) => {
    // let's be conservative here and begin at HTTP level, not TCP level. 
    // Strictly speaking, this is inaccurate, should start when last segment 
    // of response headers & body handed off over to OS and ready to be transmitted 
    // through netwok.
    let startTime = process.hrtime.bigint(); 

    // listen when socket is fully closed. Maybe this is conservative since 
    // we can listen when a FIN packet is sent. We should also investigate
    // the fluctuations in download speed and decrease variances (if significant).
    res.socket.on('close', () => {
        let endTime = process.hrtime.bigint();
        // CASE 1: no increase in byte captured on record
        if (queue[0] !== req.socket.bytesWritten) {
            if (queue[0] > req.socket.bytesWritten) {
                // CASE 2: new set of records; reset
                queue[0] = 0;
            }
            let size = req.socket.bytesWritten - queue[0];
            let time = Number(endTime - startTime) * 10 ** -9;
            let TR = size / time;
            queue.push(req.socket.bytesWritten);
            queue.shift();
            console.log(queue, `transmission rate: ${TR} byte/s`);
            serverLogger.info(TR);
        }
    });
    const text = `
        The standard Lorem Ipsum passage, used since the 1500s
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
        1914 translation by H. Rackham
        "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"
        Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
    `;
    res.json({data: text}).end();
});

/**
 * Return transmission rate (TR) statistics 
 * - effective bandwidth: highest TR
 * - throughput: average TR
 * - bottleneck: lowest TR
 * - dataset
 */
app.get("/api/stats", (req, res) => {
    let responseObj = {
        data: {
            effective_bandwidth: null,
            throughput: null,
            bottleneck: null,
            dataset: []
        }
    };
    let q = 'server';
    // default is to get server TR statistics
    if (req.query.q === 'client') {
        q = 'client';
    } 
    const rl = readline.createInterface({
        input: fs.createReadStream(`./public/logs/log_${q}.log`),
    })
    rl.on('line', (input) => {
        let speed = JSON.parse(input)["message"];
        responseObj.data.dataset.push(speed);
    }).on('close', () => {
        let d = responseObj.data;
        d.effective_bandwidth = Math.max(...d.dataset);
        d.throughput = d.dataset.reduce((acc, cur) => acc + cur) / d.dataset.length;
        d.bottleneck = Math.min(...d.dataset);
        res.json(responseObj).end();
    });
})

// send image from image api
app.get("/api/image", (req, res) => {
    const imageStr = fs.createReadStream('./public/image.jpg');
    const ps = new stream.PassThrough();
    stream.pipeline(imageStr, ps, (e) => {
        if (e) {
            console.log(e);
        }
    })
    ps.pipe(res);
    ps.on('finish', () => {
        res.end();
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`App started: http://localhost:${PORT}`);
});
