//creating the canvas that will hold our PacMan clone
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

//storing the span element from the html file to be held as score
const score = document.querySelector('#score')



//creating a Boundary class to distinguish the ends of the map
class Boundary{

    //referencing these values as they will be used later in deployment
    static width = 40
    static height = 40

    //this constructs the boundary points when it is passed a position [x and y coordinates]
    constructor({position, image}){
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    //this method draws the boundary after it is declared with x and y coordinates
    draw(){
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

//creating a PacMan class that will be the role of the player in the game
class PacMan{

    //constructs the player with position and velocity arguments for placement and movement
    constructor({position,velocity}){
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
    }

    //draws the player so it is visible on the canvas with also the "chomp" animation as well
    draw(){
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x , this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    //continuously checks for updates on movement
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if(this.radians < 0 || this.radians > 0.75){
            this.openRate = -this.openRate
        }
        this.radians += this.openRate
    }
}

//creating a Pellet class that will take the role of adding points in the game
class Pellet{

    //constructs the pellet with a position argument for placement
    constructor({position}){
        this.position = position
        this.radius = 3
    }

    //draws the pellet so it is visible on the canvas
    draw(){
        c.beginPath()
        c.arc(this.position.x , this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

//creating a Ghost class that will be the role of the enemy in the game
class Ghost{

    //the ghost's speed will be slower than Pacman's
    static speed = 2

    //constructs the ghost with position, velocity, and default color arguments for placement, movement and style
    constructor({position,velocity, color = 'red'}){
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
    }

    //draws the ghost so it is visible on the canvas
    draw(){
        c.beginPath()
        c.arc(this.position.x , this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }

    //continuously checks for updates on movement
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

//creating a PowerUp class that will take the role of a power up to win in the game
class PowerUp{

    //constructs the pellet with a position argument for placement
    constructor({position}){
        this.position = position
        this.radius = 8
    }

    //draws the pellet so it is visible on the canvas
    draw(){
        c.beginPath()
        c.arc(this.position.x , this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}



//creates an instance of Pacman, aka the player
const pacman = new PacMan ({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity:{
        x:0,
        y:0
    }
    }
)

//a set of keys is declared so the player can only go in one position even when two keys are pressed.
//diagonal movement is not needed in this enviornment
const keys = {
    ArrowUp: {
        pressed:false
    },
    ArrowDown: {
        pressed:false
    },
    ArrowLeft: {
        pressed:false
    },
    ArrowRight: {
        pressed:false
    }
}

//this variable holds the last key pressed so even when two keys are pressed, the player goes in one direction
let lastKey = ''

//this is the variable that will hold the updated player score when collecting pellets
let pScore = 0;



//this map will be the "blueprint" for the boundaries of our game, held within a 2D array. 
//Every symbol is recognized as either a boundary or pellet in the rendering of the game
const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-','2'],
    ['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.','|'],
    ['|', '.', '[]','.', '[' , '=', ']','.', '[]','.', '[]','.', '[' , '=', ']','.', '[]','.','|'],
    ['|', '.', '.', '.', '.' , '_','.', '.', '.', '.', '.', '.', '.' , '_','.', '.', '.', '.','|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', 'p', '[', ']', '.','|'],
    ['|', '.', '.', '.', '.' , 't','.', '.', '.', '.', '.', '.', '.' , 't','.', '.', '.', '.','|'],
    ['|', '.', '[]','.', '[', '+', ']', '.', '[]','.', '[]','.', '[', '+', ']', '.', '[]','.','|'],
    ['|', '.', '.', '.', '.' , '_','.', '.', '.', '.', '.', '.', '.' , '_','.', '.', '.', '.','|'],
    ['|', '.', '[', ']', 'p', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.','|'],
    ['|', '.', '.', '.', '.', 't', '.', '.', '.', '.', '.', '.', '.', 't', '.', '.', '.', '.','|'],
    ['|', '.', '[]','.', '[', '!', ']', '.', '[]','.', '[]','.', '[', '!', ']', '.', '[]','.','|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.','|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-','3'],
]

//this array will hold the Boundary objects pushed from the map
const boundaries = []

//this array will hold the Pellet objects pushed from the map
const pellets = []

//this array will hold the PowerUps objects pushed from the map
const powerUps = []

//this array will hold the Ghost objects
//they are set randomly within the regions of the map and there are four ghosts in the game 
const ghosts = [
    new Ghost({
        position: {
            x:Boundary.width * 8 + Boundary.width / 2,
            y:Boundary.height * 5 + Boundary.height / 2
        },
        velocity: {
            x:Ghost.speed,
            y:0
        }
    }),
    new Ghost({
        position: {
            x:Boundary.width * 8 + Boundary.width / 2,
            y:Boundary.height *7 + Boundary.height / 2
        },
        velocity: {
            x:Ghost.speed,
            y:0
        },
        color: '#87ceeb'
    }),
    new Ghost({
        position: {
            x:Boundary.width * 10 + Boundary.width / 2,
            y:Boundary.height *5 + Boundary.height / 2
        },
        velocity: {
            x:Ghost.speed,
            y:0
        },
        color: 'pink'
    }),
    new Ghost({
        position: {
            x:Boundary.width * 10 + Boundary.width / 2,
            y:Boundary.height * 7 + Boundary.height / 2
        },
        velocity: {
            x:Ghost.speed,
            y:0
        },
        color: 'green'
    })
]




//this function converts images into usuable html objects
function createImage(src){
    const image = new Image()
    image.src = src
    return image
}

//this populates the map with different elements of the folder img, with the symbols being replaced with boundary objects in a 2D enviornment
map.forEach((row,i) => {
    row.forEach((symbol, j) => {
        switch(symbol){
            //when a '-' is found in the 2d array map, a Horizontal Boundary will be placed at that spot
            case '-':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeHorizontal.png')
            })
            )    
            break
            //when a '|' is found in the 2d array map, a Vertical Boundary will be placed at that spot
            case '|':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeVertical.png')
            })
            )    
            break
            //when a '1' is found in the 2d array map, an upper lefthand corner edge will be placed at that spot
            case '1':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeCorner1.png')
            })
            )    
            break
            //when a '2' is found in the 2d array map, an upper righthand corner edge will be placed at that spot
            case '2':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeCorner2.png')
            })
            )    
            break
            //when a '3' is found in the 2d array map, a lower righthand corner edge will be placed at that spot
            case '3':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeCorner3.png')
            })
            )    
            break
            //when a '4' is found in the 2d array map, a lower righthand corner edge will be placed at that spot
            case '4':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeCorner4.png')
            })
            )    
            break
            //when a '[]' is found in the 2d array map, a block will be placed at that spot
            case '[]':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/block.png')
            })
            )    
            break
            //when a '[' is found in the 2d array map, a leftcap will be placed at that spot
            case '[':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/capLeft.png')
            })
            )    
            break
            //when a ']' is found in the 2d array map, a rightcap will be placed at that spot
            case ']':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/capRight.png')
            })
            )    
            break
            //when a '_' is found in the 2d array map, a bottom cap will be placed at that spot
            case '_':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/capBottom.png')
            })
            )    
            break
            //when a '=' is found in the 2d array map, a bottom connector will be placed at that spot
            case '=':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeConnectorBottom.png')
            })
            )    
            break
            //when a '+' is found in the 2d array map, a cross will be placed at that spot
            case '+':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeCross.png')
            })
            )    
            break
            //when a 't' is found in the 2d array map, a topcap will be placed at that spot
            case 't':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/capTop.png')
            })
            )    
            break
            //when a '!' is found in the 2d array map, a top pipe connector will be placed at that spot
            case '!':
            boundaries.push(
                new Boundary ({
                position: {
                    x:Boundary.width * j,
                    y:Boundary.height * i
                },
                image: createImage('img/pipeConnectorTop.png')
            })
            )    
            break
            //when a '.' is found in the 2d array map, a pellet will be placed at that spot
            case '.':
            pellets.push(
                new Pellet ({
                position: {
                    x: j * Boundary.width + Boundary.width / 2,
                    y: i * Boundary.height + Boundary.height / 2
                }
            })
            )    
            break
            //when a 'p' is found in the 2d array, a powerup will be placed at that spot
            case 'p':
            powerUps.push(
                new PowerUp ({
                position: {
                    x: j * Boundary.width + Boundary.width / 2,
                    y: i * Boundary.height + Boundary.height / 2
                }
            })
            )    
            break
        }
    })
})



//collision detection algorithm to stay within the boundary
//returns true if any of the sides of packman are overlapping with a boundary
function collisionDetection( {circle, rectangle} ){

    //this padding is taken into account for the slower movement of the ghosts
    const padding = Boundary.width / 2 - circle.radius - 1

    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding &&
            circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding &&
            circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&
            circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

//this variable is instantiated but declared later for the ending pause screen during a game over
let animationId

//an infinite loop to animate pacman, ghosts, check collisions and user movements
function animate(){

    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    //this allows the player to move through gaps upwards without stopping pacman all together 
    if(keys.ArrowUp.pressed && lastKey === 'ArrowUp'){
        for(let i = 0; i < boundaries.length; i++){
            const bound = boundaries[i];
            if(collisionDetection({
                circle: {...pacman, velocity:{
                x: 0,
                y: -5
                }},
                rectangle: bound
            })
            ) {
                pacman.velocity.y = 0
                break
                }
            else{
                pacman.velocity.y = -5
            }
        }
    }

    //this allows the player to move through gaps to their respective left without stopping pacman all together 
    else if(keys.ArrowLeft.pressed && lastKey === 'ArrowLeft'){
        for(let i = 0; i < boundaries.length; i++){
            const bound = boundaries[i];
            if(collisionDetection({
                circle: {...pacman, velocity:{
                x: -5,
                y: 0
                }},
                rectangle: bound
            })
            ) {
                pacman.velocity.x = 0
                break
                }
            else{
                pacman.velocity.x = -5
            }
        }
    }

    //this allows the player to move through gaps below them without stopping pacman all together 
    else if(keys.ArrowDown.pressed && lastKey === 'ArrowDown'){
        for(let i = 0; i < boundaries.length; i++){
            const bound = boundaries[i];
            if(collisionDetection({
                circle: {...pacman, velocity:{
                    x: 0,
                    y: 5
                }},
                rectangle: bound
            })
            ) {
                pacman.velocity.y = 0
                break
                }
            else{
                pacman.velocity.y = 5
            }
        }
    }

    //this allows the player to move through gaps to their respective right without stopping pacman all together 
    else if(keys.ArrowRight.pressed && lastKey === 'ArrowRight'){
        for(let i = 0; i < boundaries.length; i++){
            const bound = boundaries[i];
            if(collisionDetection({
                circle: {...pacman, velocity:{
                    x: 5,
                    y: 0
                }},
                rectangle: bound
            })
            ) {
                pacman.velocity.x = 0
                break
                }
            else{
                pacman.velocity.x = 5
            }
        }
    }

    //this is the algorithm that either removes a ghost upon collision when a powerup is activated
    //or ends the game upon collision if the powerup is not activated
    for(let i = ghosts.length - 1; i >= 0; i--){
        const ghost = ghosts[i]
        if (Math.hypot(
            ghost.position.x - pacman.position.x, 
            ghost.position.y - pacman.position.y) < 
            ghost.radius + pacman.radius){

                if(ghost.scared){
                    ghosts.splice(i,1)
                }
                else{
                cancelAnimationFrame(animationId)
                console.log("You Lose")
                }
            }
        }

        //win condition
        if(pellets.length === 0) {
            console.log('You win')
            cancelAnimationFrame(animationId)
        }

    //this checks whether pacman was collected a powerup
    for(let i = powerUps.length - 1; i >= 0; i--){
        const pUp = powerUps[i]
        pUp.draw()

        //this is a circle collision algorithm that detects when pacman collides with a powerup
        if (Math.hypot(
            pUp.position.x - pacman.position.x, 
            pUp.position.y - pacman.position.y) < 
            pUp.radius + pacman.radius){
            powerUps.splice(i,1)

            //make ghosts scaps
            ghosts.forEach(ghost => {
            ghost.scared = true

            setTimeout(() => {
                ghost.scared = false
                }, 10000)
            })

        }
    }

    //for better rendering purposes, pellets that are at the end of the array will be removed when the player collides with one
    //iterating starting from the end of the array, the splicing will not affect the graphics of the game, as it did when splicing from the beginning of the array
    //what the following is a pacman-pellet collision algorithm that "removes" the pellet when colliding with one and also updated the score by adding 100 when collecting a pellet
    for(let i = pellets.length - 1; i >= 0; i--){
        const pellet = pellets[i]
        pellet.draw()

        //this is a circle collision algorithm that detects when pacman collides with a pellet
        if (Math.hypot(
            pellet.position.x - pacman.position.x, 
            pellet.position.y - pacman.position.y) < 
            pellet.radius + pacman.radius){

            //this removes the pellet from the end of the array and updates the score
            pellets.splice(i,1)
            pScore +=100
            score.innerHTML = pScore
        }
    }

    //draws the boundaries out and houses the collisionDetector function call
    boundaries.forEach(boundary => {
    boundary.draw()

    //stops the player when a collision is detected (returned true)
    if(collisionDetection({
        circle: pacman,
        rectangle: boundary
    })
    ) {
        pacman.velocity.x = 0
        pacman.velocity.y = 0
    }
})

    //draws PacMan onto the canvas
    pacman.update()

    //draws the Ghosts onto the canvas
    ghosts.forEach(ghost => {
        ghost.update();

        //this array holds the directions where the ghost is colliding with a boundary
        const collisions = []

        boundaries.forEach(boundary => {

            //if the ghost has a boundary to the right of it, it will be added to the collisions array
            if(
                !collisions.includes('right') &&
                collisionDetection({
                circle: {...ghost, velocity:{
                    x: ghost.speed,
                    y: 0
                }},
                rectangle: boundary
            })
            ){
                collisions.push('right')
            }

            //if the ghost has a boundary to the left of it, it will be added to the collisions array
            if(
                !collisions.includes('left') &&
                collisionDetection({
                circle: {...ghost, velocity:{
                    x: -ghost.speed,
                    y: 0
                }},
                rectangle: boundary
            })
            ){
                collisions.push('left')
            }

            //if the ghost has a boundary to the top of it, it will be added to the collisions array
            if(
                !collisions.includes('top') &&
                collisionDetection({
                circle: {...ghost, velocity:{
                    x: 0,
                    y: -ghost.speed
                }},
                rectangle: boundary
            })
            ){
                collisions.push('top')
            }
            //if the ghost has a boundary to the bottom of it, it will be added to the collisions array
            if(
                !collisions.includes('bottom') 
                &&collisionDetection({
                circle: {...ghost, velocity:{
                    x: 0,
                    y: ghost.speed
                }},
                rectangle: boundary
            })
            ){
                collisions.push('bottom')
            }
        })

        //populates previous collisions with the collisions collected above
        if(collisions.length > ghost.prevCollisions.length){
        ghost.prevCollisions = collisions
        }

        //compares the two arrays and adds the direction to previousCollisions
        //based on the direction the ghost is currently moving in
        if(JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){
            if(ghost.velocity.x > 0){
                ghost.prevCollisions.push('right')
            }
            else if(ghost.velocity.x < 0){
                ghost.prevCollisions.push('left')
            }
            else if(ghost.velocity.y < 0){
                ghost.prevCollisions.push('top')
            }
            else if(ghost.velocity.y > 0){
                ghost.prevCollisions.push('bottom')
            }

            //pathways holds where the ghost could move given its current position
            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision)
            })

            //direction is the way the ghost does move which is randomly chose from the array
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            //of the different cases of direction, the ghost's direction is changed accordingly
            switch(direction){
                case 'bottom':
                    ghost.velocity.x = 0
                    ghost.velocity.y = ghost.speed
                    break
                case 'top':
                    ghost.velocity.x = 0
                    ghost.velocity.y = -ghost.speed
                    break
                case 'left':
                    ghost.velocity.x = -ghost.speed
                    ghost.velocity.y = 0
                    break
                case 'right':
                    ghost.velocity.x = ghost.speed
                    ghost.velocity.y = 0
                    break
            }

            //previousCollisions is emptied to restart the algorithm
            ghost.prevCollisions = []
        }
    })

    //rotates pacman so he is facing the direction he is going
    if(pacman.velocity.x > 0){
        pacman.rotation = 0;
    }
    else if(pacman.velocity.x < 0){
        pacman.rotation = Math.PI;
    }
    else if(pacman.velocity.y > 0){
        pacman.rotation = Math.PI / 2;
    }
    else if(pacman.velocity.y < 0){
        pacman.rotation = Math.PI * 1.5;
    }
}

animate()



//event listeners for arrow keys for user to control the player
//Also updates the last key pressed so diagonal movement is permitted
addEventListener('keydown', ({ key }) => {
    switch(key){
        case 'ArrowUp':
            keys.ArrowUp.pressed = true
            lastKey = 'ArrowUp'
            break

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            lastKey = 'ArrowLeft'
            break

        case 'ArrowDown':
            keys.ArrowDown.pressed = true
            lastKey = 'ArrowDown'
            break

        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            lastKey = 'ArrowRight'
            break    
    }

})

//event listeners for arrow keys so movement of Pacman stops when the user lets go of a key
addEventListener('keyup', ({ key }) => {
    switch(key){
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break

        case 'ArrowDown':
            keys.ArrowDown.pressed = false
            break

        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break    
}
})
