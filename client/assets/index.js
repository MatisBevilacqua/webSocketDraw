const BUTTON = document.querySelector('button');
const CONTAINER = document.querySelector('#color');
const RESET = document.querySelector('#reset');
const COUNT_RED = document.querySelector('#count-red');
const COUNT_BLUE = document.querySelector('#count-blue');

const GRID_DIV = document.querySelector('#grid');
let ws = new WebSocket("ws://localhost:3000")
let click = false;
let selectedColor = 'red';

const COLOR = [
  {
    color: 'blue'
  },
  {
    color: "red"
  }
]

const createColor = () => {
  for (const i in COLOR) {
    let button = document.createElement('button');
    button.textContent = COLOR[i].color;
    CONTAINER.appendChild(button);
    
    let buttonClick = button.textContent

    button.addEventListener('click', () => {
      selectedColor = buttonClick;
    })
  }
}

const resetArray = () => {
  send({ event: "reset" })
}

RESET.addEventListener('click', resetArray)

let grid;
const divs = []

const send = (data) => {
  ws.send(JSON.stringify(data));
}

const init = () => {
  grid.forEach((row, y) => {
    divs.push([]);

    row.forEach((cell, x) => {
      const div = document.createElement('div');

      divs[y].push(div);
      div.classList.add('cell');
      div.style.backgroundColor = cell;

      div.addEventListener('mousemove', (mouse) => {
        if (grid[y][x] !== null) return

        (mouse.buttons === 1)
          ? send({
            event: "update",
            data: {
              x,
              y,
              color: selectedColor
            }
          }) : null
      })

      GRID_DIV.appendChild(div);
    })
  })
}

ws.onmessage = function (msg) {
  try {
    let { event, data } = JSON.parse(msg.data)

    switch (event) {
      case "init":
        grid = data;
        init()
        createColor()
        break;
      
      case "update":
        divs[data.y][data.x].style.backgroundColor = data.color
        COUNT_RED.textContent = data.countRed
        COUNT_BLUE.textContent = data.countBlue
        break;
      case "reset":
        grid = data;
        for(const i in divs) {
          for(const j in divs[i]) {
            divs[i][j].style.backgroundColor = "#FFFFFF"; 
          } 
        }
        break;
    }
  } catch (error) {
    console.log(error);
  }
}
