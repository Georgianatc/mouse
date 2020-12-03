const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const valoareScor = document.querySelector('#valoareScor')
const butonStart = document.querySelector('#butonStart')
const fereastraStart = document.querySelector('#fereastraStart')
const scorFinal = document.querySelector('#scorFinal')

class Player{
	constructor(x,y,raza,color){
		this.x = x
		this.y = y
		this.raza = raza
		this.color = color
	}
	draw(){
		c.beginPath()
		//c.arc(x: Int, y: Int, r: Int, startAngle: Float, endAngle:Float,drawCounterClockwise: Bool(false));
		c.arc(this.x, this.y,this.raza , 0, Math.PI * 2, false)
		c.strokeStyle = '#E74C3C' //margine
		c.stroke()
		c.lineWidth = 5
		c.fillStyle = this.color //coloreaza la culoarea indicata in instanta player
		c.fill() //creaza cercul la pozitia si marimea creata de instanta player a clasei Player, de ex
	}
}

class Proiectil {
	constructor(x,y,raza){
		this.x = x;
		this.y = y;
		this.raza = raza;
	}
}

class Inamic {
	constructor(x,y,raza,color, velocity){
		this.x = x;
		this.y = y;
		this.raza = raza;
		this.color = color;
		this.velocity = velocity;
	}
	draw(){
		c.beginPath()
		//c.arc(x: Int, y: Int, r: Int, startAngle: Float, endAngle:Float,drawCounterClockwise: Bool(false));
		c.arc(this.x, this.y, this.raza, 0, Math.PI * 2, false)
		c.fillStyle = this.color //coloreaza la culoarea indicata in instanta inamic
		c.fill() //creaza cercul la pozitia si marimea creata de instanta inamic a clasei Inamic
	}

	update(){ //permite deplasarea inamicului cand este apelata in animate()
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}

//determinare centru ecran pentru plasare player
const x = canvas.width/2
const y = canvas.height/2

//valori folosite pentru prima incarcare a jocului
let player = new Player(x,y,20, '#3498DB')
let proiectile = []
let inamici = []
let scor = 0

//functie care va reseta valorile la fiecare reinceput de joc
function init(){
	player = new Player(x,y,20, '#3498DB')
	proiectile = []
	inamici = []
	scor = 0
	valoareScor.innerHTML = scor //valoarea scorului din stanga-sus
	scorFinal.innerHTML = scor //valoarea scorului din fereasta de start

}

//generare random inamici
//inamicii sunt generati aleator in afara ecranului din cele 4 laturi

function creazaInamici(){
	setInterval(() => { 
		const raza = Math.random() * (50 - 20) + 20 //inamicii pot fi mai mici sau mai mari
		let x
		let y

		if(Math.random() < 0.5){
			x = Math.random() < 0.5 ? 0-raza : canvas.width + raza //il facem sa apara "din afara ecranului cu -30 sau width/height +30"
			y = Math.random() * canvas.height
		} else {
			x = Math.random() * canvas.width //il facem sa apara "din afara ecranului cu -30 sau width/height +30"
			y = Math.random() < 0.5 ? 0-raza : canvas.height + raza
		}
		const color = `hsl(${Math.random() * 360},50%,50%)` //culoare inamicilor e aleasa aleator; h ia valori de la 0 la 360	
		const unghi=Math.atan2(canvas.height/2 - y, canvas.width/2 - x) //determinare unghi de la inamic la player
		//canvas.height/2 = valoarea pentru pozitia y a player-ului
		//canvas.width/2 = valoarea pentru pozitia pe x a playerului
		//y = pozitia pe y a inamicului
		//x= pozitia pe x a inamicului
		//diferenta pozitiilor calculeaza distanta pe cele 2 axe
		const velocity = {x: Math.cos(unghi), y: Math.sin(unghi)} //determinam cele 2 valori care vor face posibila deplasarea inamicilor
		//cos = cat.alat/ip
		//sin = cat.op/ip
		//velocity determina felul in care se misca inamicul catre player
		inamici.push(new Inamic(x,y,raza,color,velocity)) //fiecare inamic nou creat este salvat in lista de inamici

	}, 1000)
}

let animationId //va stoca frame-ul cand se sfarseste jocul

function animate(){
	animationId = requestAnimationFrame(animate) //returneaza frame-ul actual
	c.fillStyle='rgba(254, 245, 231,0.15)'
	c.fillRect(0,0, canvas.width, canvas.height) //dupa fiecare frame, se deseneaza peste cel precedent(inclusiv fundalul se redeseneaza)
	player.draw()
	inamici.forEach((inamic, inamicIndex) => {
		inamic.update() //se redeseneaza cate un inamic la fiecare cadru
		const dist = Math.hypot(player.x - inamic.x, player.y - inamic.y)

		//game over jocul se termina cand un inamic ajunge la player

		if(dist - inamic.raza - player.raza < 1){
			cancelAnimationFrame(animationId)
			fereastraStart.style.display = 'flex'
			scorFinal.innerHTML = scor
		}

		//eliminare inamici
		proiectile.forEach((proiectil, proiectilIndex) => {
			const dist = Math.hypot(proiectil.x - inamic.x, proiectil.y - inamic.y)

			if(dist - inamic.raza - proiectil.raza < 1)
			{
				//crestere scor
				scor+=10
				valoareScor.innerHTML =  scor

				//fara folosirea acestei functii la eliminarea unui inamic ar fi un efect de 'licarire'
				setTimeout(() =>{
					inamici.splice(inamicIndex, 1)
					proiectile.splice(proiectilIndex, 1)
				}, 0)
			
			}

		});
	})
	// dupa fiecare cadru, lista de proiectile se goleste
	proiectile = []
}

addEventListener('click', (event) => 
	{ 

	//cream proiectilul exact in pozitia in care dam click - proiectil static
	proiectile.push(new Proiectil(event.clientX, event.clientY, 5))


}) 

butonStart.addEventListener('click',() => { //la apasarea butonului de start
	init() //se vor reinitializa parametrii
	animate() //va incepe animatia
	creazaInamici() //inamicii se vor crea
	fereastraStart.style.display = 'none' //fereastra de start va disparea
})

