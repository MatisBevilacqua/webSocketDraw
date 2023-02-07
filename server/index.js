const express = require('express');
const app = express();
let expressWs = require('express-ws')(app);
let countRed = 0;
let countBlue = 0;
const port = 3000
const storageUser = []
let storageData = [...Array(50)].map(() => [...Array(50)]);

function send(ws, event, data) {
    ws.send(JSON.stringify({ event, data }));
}

app.use('/static', express.static('../client/assets/'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../client' });
})

app.ws('/', function (ws, req) {
    send(ws, "init", storageData)
    storageUser.push(ws)

    ws.on('message', function(msg) {
        try {
            const { event, data } = JSON.parse(msg);
            console.log(data);
            
            switch(event){
                case "reset":
                    storageData = [...Array(50)].map(() => [...Array(50)]);

                    countRed = 0;
                    countBlue = 0;
                    
                    for(const i in storageUser) {
                        send(storageUser[i], "reset", storageData);
                    }
                    break;
                case "update":
                    if (storageData[data.y][data.x] !== undefined) return;

                    storageData[data.y][data.x] = data.color;
                    data.color === "red" ? countRed++ : countBlue++
                    for(const i in storageUser) {
                        send(storageUser[i], "update", { ...data, countRed, countBlue });
                    }
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    })
})  

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
