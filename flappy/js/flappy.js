"use strict"

function novoElemento(tagName, className){ // função para criar um novo elemento com base na tag e na classe
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa=false){ // função para criar barreiras, se reversa=false cria superior, se true cria inferior
    this.elemento = novoElemento('div', 'barreira') // this para deixar o elemento visível no escopo global

    const borda = novoElemento('div', 'borda') // borda da barreira
    const corpo = novoElemento('div', 'corpo') // corpo da barreira
    this.elemento.appendChild(reversa ? borda : corpo) // se ela for uma barreira reversa a borda vem primeiro
    this.elemento.appendChild(reversa ? corpo : borda) // e depois vem o corpo

    this.setAltura = altura => corpo.style.height = `${altura}px` // função para definir altura do corpo da barreira
}

/* const b = new Barreira(true)   -> teste para ver se esta criando barreiras
b.setAltura(300)
document.querySelector('[wm-flappy]').appendChild(b.elemento) */

function ParDeBarreiras(altura, abertura, x){ // função para criar um par de barreiras
    this.elemento = novoElemento('div', 'par-de-barreiras') // cria div.par-de-barreiras

    this.superior = new Barreira(false) // cria uma barreira superior
    this.inferior = new Barreira(true) // cria uma barreira inferior

    this.elemento.appendChild(this.superior.elemento) // coloca a superior dentro da div par-de-barreiras
    this.elemento.appendChild(this.inferior.elemento) // coloca a superior dentro da div par-de-barreiras

    this.sortearAbertura = () => { // sorteia o tamanho das barreiras
        const alturaSuperior = Math.random() * (altura - abertura) // altura superior = (numero aleatorio entre 0 e 1) x (altura (do jogo) - abertura)
        const alturaInferior = altura - abertura - alturaSuperior // altura inferior = altura (do jogo) - abertura - altura Superior -> é o valor restante tirando a abertura e o superior
        this.superior.setAltura(alturaSuperior) // define a altura superior
        this.inferior.setAltura(alturaInferior) // define altura inferior
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])  // função para pegar a distancia do elemento de left e tira o 'px' para pegar o valor inteiro
    this.setX = x => this.elemento.style.left = `${x}px` // função para definir uma nova distancia para o left de elemento
    this.getLargura = () => this.elemento.clientWidth // função para pegar o tamanho da tela do usuario

    this.sortearAbertura()  // define o que a função vai retornar 
    this.setX(x) // define o que a função vai retornar
}

/* const b = new ParDeBarreiras(700, 200, 400)
document.querySelector('[wm-flappy]').appendChild(b.elemento) */

function Barreiras(altura, largura, abertura, espaco, notificarPonto){ // cria várias barreiras para o jogo
    this.pares = [ // array com 4 barreiras, é o que vamos usar no jogo, e vamos varias o tamanho delas 
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3 // velocidade que o jogo se move
    this.animar = () => { // função que faz a animação das barreiras
        this.pares.forEach(par => { // percorre o array de barreiras
            par.setX(par.getX() - deslocamento) // faz com que as barreiras se aproximem do passaro

            //quando o elemento sair da area do jogo:
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length) // define a distancia da barreira -> 1ª barreira + espaço x qtde de barreiras
                par.sortearAbertura() // define uma nova altura para a barreira
            }

            const meio = largura / 2 // metade da tela 
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio // quando passaro cruzar o meio (que é onde o passaro está)
            if(cruzouOMeio) notificarPonto() //se cruzou o meio executa a função notificarPonto
        })
    }
}

function Passaro(alturadoJogo){
    let voando = false 

    this.elemento = novoElemento('img', 'passaro') // cria o passaro
    this.elemento.src = 'imgs/passaro.png' // pega a foto do passaro 

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]) // função para pegar altura do passaro
    this.setY = y => this.elemento.style.bottom = `${y}px` //define a altura

    window.onkeydown = e => voando = true // se alguma tecla estiver sendo pressionada voando = true
    window.onkeyup = e => voando = false // se nenhum tecla estiver sendo pressionada voando = false

    $('html').on('touchstart', () => voando = true)
    $('html').on('touchend', () => voando = false)

    this.animar = () => { // gera uma função para animar  o passaro
        const novoY = this.getY() + (voando ? 8 : -5) // gera um novoY enquanto estiver segurando algum botao
        const alturaMaxima = alturadoJogo - this.elemento.clientHeight // define qual altura máxima do jogo

        if(novoY <= 0){ // se o NovoY for menor q a tela o passaro vai ficar colado na borda inferior da tela
            this.setY(0) // se altura >= AlturaMinima, altura = AlturaMinima
        } else if(novoY >= alturaMaxima){ // se for maior ou igual a alturaMaxima da tela ele vai ficar colado na borda superior da tela
            this.setY(alturaMaxima) // se altura >= AlturaMaxima, altura = AlturaMaxima
        } else {
            this.setY(novoY) // se nao passar do limite ele vai ser a altura +8px
        } 
    }

    this.setY(alturadoJogo / 2) // altura padrão do passaro é metade da tela
}

/* const barreiras = new Barreiras (700, 1200, 200, 400)
const passaro = new Passaro(700)
const areadoJogo = document.querySelector('[wm-flappy]')

areadoJogo.appendChild(passaro.elemento)
barreiras.pares.forEach(par => areadoJogo.appendChild(par.elemento))
setInterval(() => {
    barreiras.animar()
    passaro.animar()
}, 20) */

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}


function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top 
        && b.top + b.height >= a.top

        return horizontal && vertical
}

function colidiu(passaro, barreiras){ // função para determinar se o passaro colidiu com a barreira
    let colidiu = false

    barreiras.pares.forEach(ParDeBarreiras => {
        if(!colidiu){
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || 
            estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function flappyBird(){
    let pontos = 0 

    const areadoJogo = document.querySelector('[wm-flappy]')
    const altura = areadoJogo.clientHeight
    const largura = areadoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos))
        const passaro = new Passaro(altura)

        areadoJogo.appendChild(progresso.elemento)
        areadoJogo.appendChild(passaro.elemento)
        barreiras.pares.forEach(par => areadoJogo.appendChild(par.elemento))

        this.start = () => {
            // loop do jogo
            const temporizador = setInterval(() => {
               barreiras.animar()
               passaro.animar()
               if (colidiu(passaro, barreiras)){
                   clearInterval(temporizador)
               }
            }, 20);
        }
}
new flappyBird().start()