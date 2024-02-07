const audioFileInput = document.querySelector('.audioFileInput')
const audioPlayer = document.querySelector('.audioPlayer')
const equalizer = document.querySelector('.equalizer')

let audioContext
let analyser

audioFileInput.addEventListener('change', function () {
	const file = this.files[0]
	const objectURL = URL.createObjectURL(file)

	if (audioContext) {
		audioContext.close()
	}

	audioPlayer.src = objectURL
	audioPlayer.play()

	const contextClass = window.AudioContext || window.webkitAudioContext
	audioContext = new contextClass()
	analyser = audioContext.createAnalyser()

	const source = audioContext.createMediaElementSource(audioPlayer)
	source.connect(analyser)
	analyser.connect(audioContext.destination)

	const bufferLength = analyser.frequencyBinCount
	const dataArray = new Uint8Array(bufferLength)

	const bars = []
	for (let i = 0; i < 36; i++) {
		const bar = document.createElement('div')
		bar.style.backgroundColor = 'transparent'
		equalizer.appendChild(bar)
		bars.push(bar)
	}

	function renderFrame() {
		requestAnimationFrame(renderFrame)
		analyser.getByteFrequencyData(dataArray)

		bars.forEach((bar, index) => {
			const value = dataArray[Math.floor((36 - index - 1) * (bufferLength / 36))]
			// const greenValue = 179 + (value / 255) * 74;
			bar.style.backgroundColor = `rgba(179,253,177, ${value / 55})`
		})
	}
	renderFrame()
})
