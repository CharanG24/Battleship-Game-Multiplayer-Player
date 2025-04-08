document.addEventListener('DOMContentLoaded', () => {
  const userGrid = document.querySelector('.grid-user')
  const playerGrid = document.querySelector('.grid-computer')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const startButton = document.querySelector('#start')
  const turnDisplay = document.querySelector('#turn')
  const infoDisplay = document.querySelector('#info')
  const restartButton = document.getElementById('restart')
  const connect = document.querySelector('#connect')
  const userSquares = []
  const playerSquares = []
  let horizontal = true
  let isGameOver = false
  let currentPlayer = 'user'
  const width = 10
  let playerNum = 0
  let ready = false
  let enemyReady = false
  let shotFired = -1

  //Function used to generate the grids
  function generateBoard(grid, squares) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
    }
  }
  generateBoard(userGrid, userSquares)
  generateBoard(playerGrid, playerSquares)


  connect.addEventListener('click', start)

  //Function used to communticate with the server
  function start() {
  
    const socket = io();

    socket.on('player-number', num => {
      if (num === -1) {
        window.alert("Sorry, the server is full");
      } else {
        playerNum = parseInt(num)
        if(playerNum === 1) currentPlayer = "enemy"

        console.log(playerNum)

        socket.emit('check-players')
      }
    })

    socket.on('player-connection', num => {
      playerConnectedOrDisconnected(num)
    })

    socket.on('enemy-ready', num => {
      enemyReady = true
      playerReady(num)
      if (ready) Gameplay(socket)
    })

    socket.on('check-players', players => {
      players.forEach((p, i) => {
        if(p.connected) playerConnectedOrDisconnected(i)
        if(p.ready) {
          playerReady(i)
          if(i !== playerReady) enemyReady = true
        }
      })
    })

    startButton.addEventListener('click', () => {
      Gameplay(socket)
    })

    playerSquares.forEach(square => {
      square.addEventListener('click', () => {
        if(currentPlayer === 'user' && ready && enemyReady) {
          shotFired = square.dataset.id
          socket.emit('fire', shotFired)
        }
      })
    })

    socket.on('fire', id => {
      enemyGo(id)
      const square = userSquares[id]
      socket.emit('fire-reply', square.classList)
      Gameplay(socket)
    })

    socket.on('fire-reply', classList => {
      showSquare(classList)
      Gameplay(socket)
    })

    function playerConnectedOrDisconnected(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .connected span`).classList.toggle('green')
      if(parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
    }
  }

ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragover', dragOver))
userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
userSquares.forEach(square => square.addEventListener('drop', dragShip))
userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id
    console.log(selectedShipNameWithIndex)
  }))

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length
    console.log(draggedShip)
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragLeave() {
    console.log('drag leave')
  }

  //Function using to enable ships to be dragged to the player grid
  function dragShip() {
    const shipName = draggedShip.lastChild.id;
    const shipClass = shipName.slice(0, -2);
    const shipIndex = parseInt(shipName.substr(-1));
    let shipLast = shipIndex + parseInt(this.dataset.id);
    
    const selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1));
    shipLast -= selectedShipIndex;
  
    //Used to check if there a ship currently on the squares you want to place another ship, it will not all two ships to overlap
    if (horizontal) {
      for (let i = 0; i < draggedShipLength; i++) {
        const targetSquare = userSquares[parseInt(this.dataset.id) - selectedShipIndex + i];
        if (targetSquare.classList.contains('taken')) {
          return; 
        }
      }
      for (let i = 0; i < draggedShipLength; i++) {
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', shipClass);
      }
    } 
    displayGrid.removeChild(draggedShip);
  }
  
  function dragEnd() {
    console.log('dragend');
  }

  //Function to restart the game
  function restartGame() {
    location.reload();
  }
   restartButton.addEventListener('click', restartGame);

  function Gameplay(socket) {
    if(isGameOver) return
    if(!ready) {
      socket.emit('player-ready')
      ready = true
      playerReady(playerNum)
    }

    if(enemyReady) {
      if(currentPlayer === 'user') {
        turnDisplay.innerHTML = 'Your Go'
      }
      if(currentPlayer === 'enemy') {
        turnDisplay.innerHTML = "Enemy's Go"
      }
    }
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready span`).classList.toggle('green')
  }

  let destroyerCount = 0
  let submarineCount = 0
  let cruiserCount = 0
  let battleshipCount = 0
  let carrierCount = 0

  function showSquare(classList) {
    const enemySquare = playerGrid.querySelector(`div[data-id='${shotFired}']`)
    const obj = Object.values(classList)
    if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) {
      if (obj.includes('destroyer')) destroyerCount++
      if (obj.includes('submarine')) submarineCount++
      if (obj.includes('cruiser')) cruiserCount++
      if (obj.includes('battleship')) battleshipCount++
      if (obj.includes('carrier')) carrierCount++
    }
    if (obj.includes('taken')) {
      enemySquare.classList.add('boom')
    } else {
      enemySquare.classList.add('miss')
    }
    checkForWins()
    currentPlayer = 'enemy'
  }

  let playerDestroyerCount = 0
  let playerSubmarineCount = 0
  let playerCruiserCount = 0
  let playerBattleshipCount = 0
  let playerCarrierCount = 0


  function enemyGo(square) {
    if (!userSquares[square].classList.contains('boom')) {
      userSquares[square].classList.add('boom')
      if (userSquares[square].classList.contains('destroyer')) playerDestroyerCount++
      if (userSquares[square].classList.contains('submarine')) playerSubmarineCount++
      if (userSquares[square].classList.contains('cruiser')) playerCruiserCount++
      if (userSquares[square].classList.contains('battleship')) playerBattleshipCount++
      if (userSquares[square].classList.contains('carrier')) playerCarrierCount++
      checkForWins()
    } 
    currentPlayer = 'user'
    turnDisplay.innerHTML = 'Your Go'
  }

  //Function used to determine the winner
  function checkForWins() {
    let enemy = 'Player'
    if (destroyerCount === 2) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s destroyer`
      destroyerCount = 10
    }
    if (submarineCount === 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s submarine`
      submarineCount = 10
    }
    if (cruiserCount === 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s cruiser`
      cruiserCount = 10
    }
    if (battleshipCount === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s battleship`
      battleshipCount = 10
    }
    if (carrierCount === 5) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s carrier`
      carrierCount = 10
    }
    if (playerDestroyerCount === 2) {
      infoDisplay.innerHTML = `${enemy} sunk your destroyer`
      playerDestroyerCount = 10
    }
    if (playerSubmarineCount === 3) {
      infoDisplay.innerHTML = `${enemy} sunk your submarine`
      playerSubmarineCount = 10
    }
    if (playerCruiserCount === 3) {
      infoDisplay.innerHTML = `${enemy} sunk your cruiser`
      playerCruiserCount = 10
    }
    if (playerBattleshipCount === 4) {
      infoDisplay.innerHTML = `${enemy} sunk your battleship`
      playerBattleshipCount = 10
    }
    if (playerCarrierCount === 5) {
      infoDisplay.innerHTML = `${enemy} sunk your carrier`
      playerCarrierCount = 10
    }

    if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
      window.alert("Player 1 Wins");
      gameOver()
    }
    if ((playerDestroyerCount + playerSubmarineCount + playerCruiserCount + playerBattleshipCount + playerCarrierCount) === 50) {
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
      gameOver()
    }
  }

  function gameOver() {
    isGameOver = true
    startButton.removeEventListener('click', Gameplay)
  }
})
