window.onload = function() {

    var volumeSlider = document.getElementById("volumeSlider");
    var volVal = 0;
    var thresVal;

    var sine = document.getElementById("sine");
    var saw = document.getElementById("saw");
    var sq = document.getElementById("sq");
    var tri = document.getElementById("tri");

    var funGrain = document.getElementById("grain");

    var context = new AudioContext();

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext('2d');
    var W = window.innerWidth;
    var H = window.innerHeight;
    var X = 100;
    var Y = 100;
    var particles = [];

    var request = new XMLHttpRequest();
    request.open('GET', "./audio/Anyhow.mp3", true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        context.decodeAudioData(request.response, function(arrayBuffer) {
            buffer = arrayBuffer;
        }, onError);
    };
    request.send();

    function onError() { console.log("Bad browser! No Web Audio API for you"); }

    for (var i = 0; i < 4; i++) {
        particles.push(new create_particle());

    }

    function create_particle() {
        this.X = Math.random() * W;
        this.Y = Math.random() * H;
        this.VX = Math.random() * 100 - 10;
        this.VY = Math.random() * 100 - 10;
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function draw() {
        ctx.fillStyle = '#111111';
        //ctx.fillRect(20,20,150,100);
        for (var t = 0; t < particles.length; t++) {
            var p = particles[t];
            ctx.beginPath();
            ctx.fillStyle = getRandomColor();
            ctx.arc(p.X, p.Y, 40, Math.PI * 2, false);
            ctx.fill();
            p.X += p.VX;
            p.Y += p.VY;
            if (p.X < -50) {
                p.X = W + 50;
                play();
            } else {
                stop();
            }
            if (p.Y < -50) {
                p.Y = H + 50;
                play2();
            }
            if (p.X > W + 50) {
                p.X = -50;
                play();
            }
            if (p.Y > H + 50) {
                p.Y = -50;
                play2();
            }
        }

    }

    function clear() {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    canvas.addEventListener("mouseover", function() {
        setInterval(draw, 60);
        //var refreshIntervalId = setInterval(draw, 20);
        //draw();

    });
    //clearInterval(clear,20);
    //clearInterval(draw,20);
    var refreshIntervalId = setInterval(draw, 20);
    //clear();
    //clearInterval(refreshIntervalId);
    //stop();
    canvas.addEventListener("mouseout", function() {
        clearInterval(refreshIntervalId);
        setInterval(clear, 20);
        //stop();

    });

    var oscillator = context.createOscillator();
    var gain = context.createGain();
    var colGain = context.createGain();
    var mixGain = context.createGain();

    oscillator.type = 'sine';
    oscillator.start(0);

    gain.gain.value = 0;
    colGain.gain.value = 0;

    volumeSlider.oninput = function() {

        this.step = "0.1";
        this.max = "0.8";
        this.min = "0";
        volVal = this.value;
        volumeRange.innerHTML = volVal;
        colGain.gain.value = volVal;


        return volVal;

    };

        sine.addEventListener("mouseover", function() {
        oscillator.type = 'sine';

    });
        tri.addEventListener("mouseover", function() {
        oscillator.type = 'triangle';

    });
        sq.addEventListener("mouseover", function() {
        oscillator.type = 'square';

    });
        saw.addEventListener("mouseover", function() {
        oscillator.type = 'sawtooth';

    });


    getSample('https://dl.dropboxusercontent.com/u/30075450/Greek%207%20Echo%20Hall.wav', function(impulse) {

        var convolver = context.createConvolver()
        var buffer = context.createBufferSource()
        convolver.buffer = impulse

            /* Connections */
        oscillator.connect(gain);
        gain.connect(convolver);
        convolver.connect(colGain);
        colGain.connect(mixGain);
        

    });


    function getSample(url, cb) {
        var request = new XMLHttpRequest()
        request.open('GET', url)
        request.responseType = 'arraybuffer'
        request.onload = function() {
            context.decodeAudioData(request.response, cb)
        }
        request.send()
    }

    //FUN GRAINS
   funGrain.addEventListener("mouseover", function() {

       var source = context.createBufferSource();
       var grainGain = context.createGain();
       var panNode = context.createStereoPanner();
       var now = context.currentTime;

       source.buffer = buffer;
       var soundDuration = source.buffer.duration;

       var randomParts = Math.random() * (soundDuration - 0.1) + 0.1;
       var randomPitch = Math.random() * (2 - -0.5) + -0.5;
       var randomPan = Math.random() * (1 - -1) + -1;

       panNode.pan.value = randomPan;

       source.playbackRate.value = randomPitch;

       grainGain.gain.setValueAtTime(0, now);
       grainGain.gain.linearRampToValueAtTime(1, now + 0.1);
       grainGain.gain.linearRampToValueAtTime(0, now + 0.1 + 0.3);

       source.connect(panNode);
       panNode.connect(grainGain);
       grainGain.connect(context.destination);

       source.start(now, randomParts, 3);

   }, false);


   //HOVER FUN
   var hoverGain = context.createGain();
   var hoverOsc = context.createOscillator();
   var analyser = context.createAnalyser();
   var compressor = context.createDynamicsCompressor();

    hoverOsc.type = 'sine';
    hoverOsc.frequency.value = 500;
    hoverGain.gain.value = 0;
    hoverOsc.start(context.currentTime);

 var threshold = document.getElementById("compressorSlider")

    threshold.oninput = function() {

        this.step = "1";
        this.max = "100";
        this.min = "-100";
        thresVal = this.value;
        thresRange.innerHTML = thresVal;
        compressor.threshold.value = thresVal;


        return thresVal;

    };

  compressor.attack.value = 0;
  compressor.release.value = 0.25;

    hoverOsc.connect(hoverGain);
    hoverGain.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(mixGain);

    var canvasHov = document.getElementById('canvasHov');
    var WIDTH = 1000;
    var HEIGHT = 400;

    var myCanvas = canvasHov.getContext('2d');
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    /*an unsigned long value half that of the FFT size. This generally equates to 
the number of data values you will have to play with for the visualization*/
    var dataArray = new Uint8Array(bufferLength);
    myCanvas.clearRect(0, 0, WIDTH, HEIGHT);

    function drawHover() {

        drawVisual = requestAnimationFrame(drawHover);
        analyser.getByteTimeDomainData(dataArray);
        myCanvas.fillStyle = '#111111';
        myCanvas.fillRect(0, 0, WIDTH, HEIGHT);
        myCanvas.lineWidth = 2;
        myCanvas.strokeStyle = 'white';
        myCanvas.beginPath();

        var sliceWidth = WIDTH * 1 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128;
            var y = v * HEIGHT / 2;
            if (i === 0) {
                myCanvas.moveTo(x, y);
            } else {
                myCanvas.lineTo(x, y);
            }
            x += sliceWidth;
        }
        myCanvas.lineTo(WIDTH, HEIGHT / 2);
        myCanvas.stroke();
    }
 
    canvasHov.addEventListener('mouseover', function() {
        hoverGain.gain.value = 0.8;
        //mixGain.gain.value = 0.5;
        drawHover();
        console.log("works?");
        
       
    });

    canvasHov.addEventListener('mouseout', function() {
        hoverGain.gain.value = 0;
    });
  
    drawHover();


    function play() {
        oscillator.frequency.value = Math.random() * (900 - 100) + 100;
        gain.gain.value = 4;
    }

    function play2() {
        oscillator.frequency.value = Math.random() * (400 - 50) + 50;
        gain.gain.value = 1;
    }

    function stop() {
        gain.gain.value = 0;
    }

    //KICK SOUNDS - START
    var filterGain = context.createGain();

    function kick() {

        var osc = context.createOscillator();
        var osc2 = context.createOscillator();
        var gainOsc = context.createGain();
        var gainOsc2 = context.createGain();

        osc.type = 'triangle';
        osc2.type = 'sine';

        gainOsc.gain.setValueAtTime(1, context.currentTime);
        gainOsc.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
        gainOsc.connect(context.destination);
        gainOsc2.gain.setValueAtTime(1, context.currentTime);
        gainOsc2.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
        gainOsc2.connect(context.destination);
        osc.frequency.setValueAtTime(120, context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1, context.currentTime + 0.5);
        osc2.frequency.setValueAtTime(50, context.currentTime);

        //Connections
        osc.connect(gainOsc);
        osc2.connect(gainOsc2);
        gainOsc2.connect(mixGain);
        gainOsc.connect(mixGain);

        // mixGain.gain.value = 1;

        osc.start(context.currentTime);
        osc2.start(context.currentTime);
        osc.stop(context.currentTime + 0.5);
        osc2.stop(context.currentTime + 0.5);
    }

    //BUTTON
    mixButton.addEventListener('mouseover', function() {
        draw2();
    });

    //INTERVALS
    function interval(func, wait, times) {
        var interv = function(w, t) {
            return function() {
                if (typeof t === 'undefined' || t-- > 0) {
                    setTimeout(interv, w);
                    try {
                        func.call(null);
                    } catch (e) {
                        t = 0;
                        throw e.toString();
                    }
                }
            };
        }(wait, times);
        setTimeout(interv, wait);
    }

    //TESTING REQUESTANIMATIONFRAME FOR SCHEDULING
    var newBoxes2 = document.getElementById('container2');
    var fps = 6;

    //DRAW BOXES
    function createBox(instrument) {

        box = document.createElement('div');
        box.style.width = '300px';
        box.style.height = '50px';
        box.style.background = 'orange';
        box.style.position = 'relative';
        box.style.float = 'left';

        switch (true) {       
            case instrument === kick:
                kick();
                box.innerHTML = '<div class=\'test\'></div>';
                if(newBoxes2 != null){
                newBoxes2.appendChild(box);
                newBoxes2.style.width = '900px';
                newBoxes2.style.height = '60px';
                //newBoxes2.style.position = 'relative';
                newBoxes2.style.display = 'in-line';
                newBoxes2.style.color = "black";
                //newBoxes2.style.border = '10px solid white';
                }
                break;
        }

    };

    function draw2() {

        var Timer = setInterval(function() {

            //requestAnimationFrame(draw2);

            if (container2 != null) {
                var elements = container2.getElementsByTagName('div').length;
                console.log(elements);

                if (elements % 2 == 0 || elements == 0) {
                    createBox(kick);
                    
                }
                
                while (newBoxes2.hasChildNodes() && elements > 20) {
                    newBoxes2.removeChild(newBoxes2.firstChild);
                }
            }
        }, 1000 / fps);

        var stopIt = document.getElementById('stopButton');

        stopIt.addEventListener('mouseover', function() {
            clearInterval(Timer);
        });
    };
    
//KICK SOUNDS - END

//GENERATING NOISE

    var noiseButton = document.getElementById('noiseButton');
    noiseButton.addEventListener('mouseover', function() {
        noise();
    });

    function noise() {

        var node = context.createBufferSource(),
            buffer = context.createBuffer(1, 4096, context.sampleRate),
            data = buffer.getChannelData(0);
        for (var i = 0; i < 4096; i++) {
            data[i] = Math.random();
        }
        node.buffer = buffer;
        node.loop = true;
        node.start(context.currentTime);
        node.stop(context.currentTime + 0.2);
        node.connect(mixGain);
    }


    //Ultimate connection
    mixGain.connect(context.destination);

};
