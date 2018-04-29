require([ "bower_components/threex.spaceships/package.require.js",
		"bower_components/threex.spaceships/threex.spaceships-r69.js",
		"bower_components/threex.spaceships/examples/vendor/three.js/examples/js/loaders/OBJLoader.js",
        "bower_components/threex.spaceships/examples/vendor/three.js/examples/js/loaders/MTLLoader.js",
        "bower_components/threex.keyboardstate/package.require.js",
        "bower_components/threex.planets/package.require.js",
        "bower_components/webaudiox/build/webaudiox.js"
		], function(){
	// detect WebGL
	if( !Detector.webgl ){
		Detector.addGetWebGLMessage();
		throw 'WebGL Not Available'
	} 
	// setup webgl renderer full page
	var renderer	= new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	// setup a scene and camera
	var scene	= new THREE.Scene();
	var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 3;
    
    // declare the rendering loop
	var onRenderFcts= [];

	// handle window resize events
	var winResize	= new THREEx.WindowResize(renderer, camera)

    // audio 
    var context = new AudioContext();
    var lineOut = new WebAudiox.LineOut(context);
    lineOut.volume = 0.2;

    var soundBuffer;
    var soundUrl = 'sounds/explosion.mp3';
    WebAudiox.loadBuffer(context,soundUrl, function(buffer){
        soundBuffer = buffer;
    });

    var gameOverFlag = false;

    function playExplosionSound(){
        if(soundBuffer)
        {
            var source = context.createBufferSource();
            source.buffer = soundBuffer;
            source.connect(lineOut.destination);
            source.start(0);
            return source;
        }
    };

    //spaceship
	var spaceship = null;
	THREEx.SpaceShips.loadSpaceFighter03(function(object3d){
		scene.add(object3d);
        spaceship = object3d;
        spaceship.rotateY(Math.PI/2);
        spaceship.position.x = -1;
	});
    
    onRenderFcts.push(function(delta, now){
        if(spaceship == null)
            return;
        var moonDistance = moonMesh.position.distanceTo(spaceship.position);
        var uranusDistance = meshUranus.position.distanceTo(spaceship.position);
        if(moonDistance < 0.3)
        {
            resetMoon();
            playExplosionSound();
            score++;
            setScore();
        }
        if(uranusDistance < 0.3)
        {
            resetUranus();
            playExplosionSound();
            score++;
            setScore();
        }
        findPosition(moonMesh.position);
        gameOver(moonMesh.position);
    });
    
    //Planet
    var moonMesh = THREEx.Planets.createMoon();
    scene.add(moonMesh);
    var moonSpeed = 3.5;
    function resetMoon() {
        if(!gameOverFlag)
        {
            moonMesh.position.x = 5;
            moonMesh.position.x += moonSpeed * (Math.random()-0.5);
            moonMesh.position.y = 2 * (Math.random()-0.5);
        }
    }
    resetMoon();

    onRenderFcts.push(function(delta, now){
        moonMesh.position.x += -3* delta;
        if(moonMesh.position.x <= -5)
            resetMoon();
    });

    // create
    var meshUranus	= THREEx.Planets.createUranus()
    scene.add(meshUranus);
    var uranusSpeed = 3.5;
    function resetUranus() {
        if(!gameOverFlag)
        {
            meshUranus.position.x = 5;
            meshUranus.position.x += uranusSpeed * (Math.random()-0.5);
            meshUranus.position.y = 2 * (Math.random()-0.5);
        }
    }
    resetUranus();

    onRenderFcts.push(function(delta, now){
        meshUranus.position.x += -3* delta;
        if(meshUranus.position.x <= -3)
            resetUranus();
    });

    // Stars
    var geometry = new THREE.SphereGeometry(90,32,32);
    var url = 'bower_components/threex.planets/images/galaxy_starfield.png';
    var material = new THREE.MeshBasicMaterial({
        map : THREE.ImageUtils.loadTexture(url),
        side : THREE.BackSide
    });

    var starMesh = new THREE.Mesh(geometry,material);
    scene.add(starMesh);

    // Keybaord 
    var speed = 1;
    var keyboard = new THREEx.KeyboardState();
    onRenderFcts.push(function(delta, now){
        if(spaceship == null)
            return;        
        
        if(keyboard.pressed('down')) {
            spaceship.position.y -= speed * delta;        
        } else if (keyboard.pressed('up')) {
            spaceship.position.y += speed * delta;
        }            
    });

    

    //////////////////////////////////////////////////////////////////////////////////
	//		default 3 points lightning					//
	//////////////////////////////////////////////////////////////////////////////////
        
    
    var ambientLight= new THREE.AmbientLight( 0x020202 )
	scene.add( ambientLight)
	var frontLight	= new THREE.DirectionalLight('white', 1)
	frontLight.position.set(0.5, 0.5, 2)
	scene.add( frontLight )
	var backLight	= new THREE.DirectionalLight('white', 0.75)
	backLight.position.set(-0.5, -0.5, -2)
    scene.add( backLight );
    
    // score
    var score = 0;
    var scoreDiv = document.getElementById('score');
    function setScore()
    {
        if(!gameOverFlag)
        {
            scoreDiv.innerHTML = "Score :" + score;
            if(score % 5 == 0)
            {
                level++;
                setLevel();
            }
        }
    }

    var level = 1;
    var levelDiv = document.getElementById('level');
    function setLevel()
    {
        levelDiv.innerHTML = "Level : " + level;
        moonSpeed = moonSpeed + 0.5;
        uranusSpeed = uranusSpeed + 0.5;
        speed = speed + 0.1;
    }
    var positionDiv = document.getElementById('positions');
    function findPosition(position) {

       // positionDiv.innerHTML = " x: " + position.x + ", y: " + positions.y + ", z: " + position.z;
       
    }
    var gameOverDiv = document.getElementById('gameOver');
    function gameOver(position)
    {
        if(position.x <= -3)
        {
            gameOverDiv.style.display = "inline";
            gameOverFlag = true;
            moonSpeed = 0;
            uranusSpeed = 0;
        }
    }
	//////////////////////////////////////////////////////////////////////////////////
	//		Camera Controls							//
	//////////////////////////////////////////////////////////////////////////////////
	var mouse	= {x : 0, y : 0}
	document.addEventListener('mousemove', function(event){
		mouse.x	= (event.clientX / window.innerWidth ) - 0.5
		mouse.y	= (event.clientY / window.innerHeight) - 0.5
	}, false);

	onRenderFcts.push(function(delta, now){
		camera.position.x += (mouse.x*5 - camera.position.x) * (delta*3)
		camera.position.y += (mouse.y*5 - camera.position.y) * (delta*3)
		camera.lookAt( scene.position )
	});
	
	//////////////////////////////////////////////////////////////////////////////////
	//		render the scene						//
	//////////////////////////////////////////////////////////////////////////////////
	onRenderFcts.push(function(){
		renderer.render( scene, camera );		
	})
	
	//////////////////////////////////////////////////////////////////////////////////
	//		Rendering Loop runner						//
	//////////////////////////////////////////////////////////////////////////////////
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000)
		})
	})
});