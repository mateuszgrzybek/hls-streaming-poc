const express = require('express');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve audio segments and playlist
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Endpoint to convert and segment WAV file
app.get('/convert', (req, res) => {
  const fileName = 'supported_wav';
	const inputFilePath = path.join(__dirname, 'audio', `${fileName}.wav`); // change to the file name you want to convert

	ffmpeg(inputFilePath)
		.audioCodec('libmp3lame')
		.toFormat('mp3')
		.outputOptions(['-vn', '-ar 16000', '-ac 1', '-b:a 256k'])
		.output(path.join(__dirname, 'audio', `${fileName}.mp3`))
		.on('end', () => {
			console.log('Conversion to mp3 finished. Proceeding with creating HLS segments...');
			ffmpeg(path.join(__dirname, 'audio', `${fileName}.mp3`))
				.outputOptions([
					'-codec: copy',
					'-hls_time 10',
					'-hls_playlist_type vod',
					'-hls_base_url http://localhost:3000/hls/',
					'-hls_segment_filename audio/hls/%03d.ts',
				])
				.output(path.join(__dirname, 'audio', 'hls', 'index.m3u8'))
				.on('progress', (progress) => {
					console.log('Processing: ' + progress.percent + '% done');
				})
				.on('end', () => {
					console.log('HLS segmentation finished');
					res.send('HLS segmentation finished');
				})
				.on('error', (err, stdout, stderr) => {
					console.error('Error during HLS segmentation', err);
					console.error('stdout:', stdout);
					console.error('stderr:', stderr);
					res.status(500).send('Error during HLS segmentation');
				})
				.run();
		})
		.on('error', (err) => {
			console.error('Error during conversion to mp3', err);
			res.status(500).send('Error during conversion to mp3');
		})
		.run();
});

// Endpoint to serve the m3u8 segments playlist
app.get('/playlist', (req, res) => {
	res.sendFile(path.join(__dirname, 'audio', 'hls', 'index.m3u8'));
});

// Endpoint to serve the audio segments
app.get('/hls/:segment', (req, res) => {
	const segment = req.params.segment;
	res.sendFile(path.join(__dirname, 'audio', 'hls', segment));
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
