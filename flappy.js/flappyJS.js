function novoElemento(tagName, className){
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')
    
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new Barreira(true)
// b.setAltura(200)
// document.querySelector('[my-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'Par-De-Barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDeBarreiras(650, 250, 800)
// document.querySelector('[my-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]
    
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco  * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio){notificarPonto()}
        })
    }
}

function Bird(alturaJogo) {
    let voando = false
    
    this.elemento = novoElemento('img', 'bird')
    this.elemento.src = '../img/flappyRed.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]) //para saber a posicao do passaro
    this.setY = y => this.elemento.style.bottom = `${y}px`
    
    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const altMax = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0) {
            this.setY(0)
        }else if(novoY >= altMax){
            this.setY(altMax)
        }else{
            this.setY(novoY)
        }

        if(voando == true){
            this.elemento.src = '../img/flappywing.png'
        }else if(voando == false){
            this.elemento.src = '../img/flappyRed.png'
        }
    }
    this.setY(alturaJogo / 2)
}

function Progresso() {
   this.elemento = novoElemento('span', 'progresso')
   this.atualizarPontos = pontos => {
       this.elemento.innerHTML = pontos
   }
   this.atualizarPontos(0)
   
}

// const barreiras = new Barreiras(650, 1280, 200, 400)
// const passaro = new Bird(650) 
// const areaDoJogo = document.querySelector('[my-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)
function Fade(){
       const f = document.querySelector('#instrucao')
       f.classList.add('fade')
    }

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect() // pega o retangulo
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top 
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colisao(bird, barreiras){
    let colisao = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colisao){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colisao = estaoSobrepostos(bird.elemento, superior)
                || estaoSobrepostos(bird.elemento, inferior)
        }
    })
    return colisao
}

function FlappyBird() {
    let pontos = 0
    const areaDoJogo = document.querySelector('[my-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos))
    const bird = new Bird(altura)
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(bird.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    this.start = () => {
        // loop do jogo basico
        const temporizador = setInterval(() => {
            barreiras.animar()
            bird.animar()
            Fade()
            if (colisao(bird, barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()