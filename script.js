const audioFileInput = document.querySelector('.audioFileInput')
const audioPlayer = document.querySelector('.audioPlayer')
const equalizer = document.querySelector('.equalizer')
const toggleBtn = document.querySelector('.toggle-btn')
const volumeSlider = document.querySelector('.volume-slider')
const seekSlider = document.querySelector('.seek-slider')
const timeLabel = document.querySelector('.time-label')
const muteBtn = document.querySelector('.mute-button')

let previousVolume = 1

function initializeAudio() {
	const file = audioFileInput.files[0]
	const objectURL = URL.createObjectURL(file)

	audioPlayer.src = objectURL
	audioPlayer.load()
	toggleBtn.classList.add('fa-play')

	const contextClass = window.AudioContext || window.webkitAudioContext
	const audioContext = new contextClass()
	const analyser = audioContext.createAnalyser()

	const source = audioContext.createMediaElementSource(audioPlayer)
	source.connect(analyser)
	analyser.connect(audioContext.destination)

	const bufferLength = analyser.frequencyBinCount
	const dataArray = new Uint8Array(bufferLength)

	createBars(bufferLength)
	renderFrame(analyser, dataArray, bufferLength)

	audioPlayer.volume = volumeSlider.value / 100
	audioPlayer.currentTime = seekSlider.value
	audioPlayer.addEventListener('loadedmetadata', () => {
		seekSlider.max = audioPlayer.duration
	})
}

function createBars(bufferLength) {
	for (let i = 0; i < 36; i++) {
		const bar = document.createElement('div')
		bar.classList.add('bar')
		equalizer.appendChild(bar)
	}
}

function renderFrame(analyser, dataArray, bufferLength) {
	const bars = document.querySelectorAll('.bar')
	let animationId

	function draw() {
		animationId = requestAnimationFrame(draw)
		analyser.getByteFrequencyData(dataArray)

		for (let i = 0; i < bars.length; i++) {
			const value = dataArray[Math.floor((bufferLength / 36) * (bars.length - i - 1))]
			const heightPercentage = (value / 25) * 100
			const height = heightPercentage * 0.8
			bars[i].style.backgroundColor = `rgba(179, 253, 177, ${height}%)`
		}
	}

	toggleBtn.addEventListener('click', function () {
		if (audioPlayer.paused) {
			audioPlayer.play()
			toggleBtn.classList.remove('fa-play')
			toggleBtn.classList.add('fa-pause')
		} else {
			audioPlayer.pause()
			toggleBtn.classList.remove('fa-pause')
			toggleBtn.classList.add('fa-play')
		}
	})

	audioPlayer.addEventListener('play', () => {
		draw()
	})

	audioPlayer.addEventListener('pause', () => {
		cancelAnimationFrame(animationId)
	})

	audioPlayer.addEventListener('timeupdate', () => {
		const currentTime = formatTime(audioPlayer.currentTime)
		const duration = isNaN(audioPlayer.duration) ? '0:00' : formatTime(audioPlayer.duration)
		seekSlider.value = audioPlayer.currentTime
		timeLabel.textContent = `${currentTime} / ${duration}`
	})
}

function formatTime(time) {
	const minutes = Math.floor(time / 60)
	const seconds = Math.floor(time % 60)
	const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds
	return `${minutes}:${formattedSeconds}`
}

const handleMute = () => {
	muteBtn.classList.toggle('fa-volume-high')
	muteBtn.classList.toggle('fa-volume-xmark')

	if (muteBtn.classList.contains('fa-volume-xmark')) {
		if (audioPlayer.volume !== 0) {
			previousVolume = audioPlayer.volume
		}
		audioPlayer.volume = 0
		volumeSlider.value = 0
	} else {
		audioPlayer.volume = previousVolume
		volumeSlider.value = previousVolume * 100
	}
}

volumeSlider.addEventListener('input', function () {
	audioPlayer.volume = volumeSlider.value / 100
})

seekSlider.addEventListener('input', function () {
	audioPlayer.currentTime = seekSlider.value
})

audioFileInput.addEventListener('change', function () {
	initializeAudio()
})

audioPlayer.addEventListener('ended', () => {
	toggleBtn.classList.remove('fa-pause')
	toggleBtn.classList.add('fa-play')
	cancelAnimationFrame(animationId)

	const bars = document.querySelectorAll('.bar')
	bars.forEach(bar => {
		bar.style.backgroundColor = 'transparent'
	})
})

muteBtn.addEventListener('click', handleMute)
initializeAudio()
