    //Fetching the elements By ID:
    console.log("JS STARTED")
    const videoElement = document.querySelector("#video");
    const startRecordButton = document.querySelector("#startRecord");
    const stopRecordButton = document.querySelector("#stopRecord");
    const playRecordButton = document.querySelector("#playRecord");
    const canvas = document.querySelector("#canvas");

    let mediaRecorder;
    let chunks = [];

    startRecordButton.addEventListener("click", startRecording);
    stopRecordButton.addEventListener("click", segmentAndUpload);
    playRecordButton.addEventListener("click", playRecording);

    async function startRecording() {
        //Fetching the elements By ID:
        const videoElement = document.querySelector("#video");
        const startRecordButton = document.querySelector("#startRecord");
        const stopRecordButton = document.querySelector("#stopRecord");
        const playRecordButton = document.querySelector("#playRecord");
        const canvas = document.querySelector("#canvas");

        let mediaRecorder;
        let chunks = [];

        startRecordButton.addEventListener("click", startRecording);
        stopRecordButton.addEventListener("click", segmentAndUpload);
        playRecordButton.addEventListener("click", playRecording);

        //const videoElement = document.getElementById('video');

        const constraints = {
            audio: true,
            video: {
                width: {
                    exact: 1280
                },
                height: {
                    exact: 720
                },
                frameRate: {
                    ideal: 30,
                    max: 30
                },
            },
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(mediaStream => {
                videoElement.srcObject = mediaStream;
                const mediaRecorder = new MediaRecorder(mediaStream);
                const recordedChunks = [];

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const recordedBlob = new Blob(recordedChunks, {
                        type: 'video/mp4'
                    });
                    // call the function to segment and upload the recordedBlob
                };

                mediaRecorder.start();
            })
            .catch(error => console.error(error));

    }

    //Function to Stop Recording
    function stopRecording() {
        mediaRecorder.stop();
        video.srcObject = null;
        chunks = [];
    }

    async function segmentAndUpload(videoBlob) {
        const segmentLength = 3000; // 3 seconds in milliseconds
        const segmentCount = Math.ceil(videoBlob.size / segmentLength);
        const segments = [];

        for (let i = 0; i < segmentCount; i++) {
            const start = i * segmentLength;
            const end = Math.min(start + segmentLength, videoBlob.size);
            const segmentBlob = videoBlob.slice(start, end);
            segments.push(segmentBlob);
        }

        const formData = new FormData();
        for (let i = 0; i < segments.length; i++) {
            formData.append('segments[]', segments[i], `segment_${i}.mp4`);
        }

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('Video uploaded successfully');
            } else {
                console.error('Failed to upload video');
            }
        } catch (error) {
            console.error(error);
        }
    }

    function playRecording() {
        const videoURL = window.URL.createObjectURL(new Blob(chunks, {
            type: "video/webm"
        }));
        video.src = videoURL;
        video.play();
    }