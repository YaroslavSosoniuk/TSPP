var scene, camera, renderer;
init();
initGraph();
render();
var cpx = camera.position.x;
var cpz = camera.position.z;
var radius = Math.sqrt(cpx*cpx + cpz*cpz);
animate();
function init(){
    scene = new THREE.Scene();
    var SCREEN_WIDTH=window.innerWidth, SCREEN_HEIGHT=window.innerHeight;
    var VIEW_ANGLE=45, ASPECT=SCREEN_WIDTH/SCREEN_HEIGHT;
    var canvas = document.getElementById('canvas');
    console.log(canvas.width);
    var NEAR=0.1, FAR=2000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 10, 100);
    camera.lookAt(scene.position);
    renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.shadowMapEnabled = true;
    renderer.setClearColor(0x222222);
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT);
    var ambient_light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( ambient_light );
    var positions = [[100,100,100],[-100,-100,100],[-100,100,100],[100,-100,100]];
    for(var i=0;i<4;i++){
    var light=new THREE.DirectionalLight(0x555555);
    light.position.set(positions[i][0],positions[i][1],0.4*positions[i][2]);
    //scene.add(light);
    }
    //initGrid();
    var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
    light1 = new THREE.PointLight( 0xff0040, 2, 50 );
    light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040} ) ) );
    /*light1.position.x -= 20;
    light1.position.y = 20;
    light1.position.z = 30;*/
	scene.add( light1 );
    light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
	light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
	scene.add( light2 );
	light3 = new THREE.SpotLight( 0xffffff,1 );
    light3.angle = Math.PI / 4;
	light3.penumbra = 0.05;
	light3.decay = 2;
	light3.distance = 200;
	light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
	scene.add( light3 );
    light4 = new THREE.PointLight( 0xffaa00, 2, 50 );
	light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
	scene.add( light4 );
}

function initGrid(){
    var BIGIN=-10, END=10, WIDTH=END-BIGIN;
    var plane_geometry = new THREE.PlaneGeometry(WIDTH,WIDTH);
    var plane_material = new THREE.MeshLambertMaterial({color:0xf0f0f0, shading: THREE.FlatShading, overdraw: 0.5, side: THREE.DoubleSide});
    var plane = new THREE.Mesh(plane_geometry, plane_material);
    plane.rotation.x -= Math.PI/4;
    scene.add(plane);

    var geometry = new THREE.Geometry();

    for(var i=BIGIN;i<=END;i+=2){
        geometry.vertices.push(new THREE.Vector3(BIGIN,i,0));
        geometry.vertices.push(new THREE.Vector3(END,i,0));
        geometry.vertices.push(new THREE.Vector3(i,BIGIN,0));
        geometry.vertices.push(new THREE.Vector3(i,END,0));
    }

    var material = new THREE.LineBasicMaterial( { color: 0x999999, opacity: 0.2 } );

    var line = new THREE.Line(geometry, material);
    line.type = THREE.LinePieces;
    line.rotation.x -= Math.PI/4;
    scene.add(line);


}

function initGraph(){
    data = initData();
    var geometry = new THREE.Geometry();
    var colors = [];

    var width = data.length, height = data[0].length;
    console.log(width);
    console.log(height);
    data.forEach(function(col){
           col.forEach(function(val){
                  geometry.vertices.push(new THREE.Vector3(val.x,val.y,val.z));
                  val.z>=0 ? colors.push(getColor(0.26,0.67,1)) : colors.push(getColor(1,1,1));
                  console.log("x " + val.x + " y " +  val.y + " z " + val.z);
           });
    });

    var offset = function(x,y){
           return x*width+y;
    }

    for(var x=0;x<width-1;x++){
        for(var y=0;y<height-1;y++){
            var vec0 = new THREE.Vector3(), vec1 = new THREE.Vector3(), n_vec = new THREE.Vector3();
            // one of two triangle polygons in one rectangle
            vec0.subVectors(geometry.vertices[offset(x,y)],geometry.vertices[offset(x+1,y)]);
            vec1.subVectors(geometry.vertices[offset(x,y)],geometry.vertices[offset(x,y+1)]);
            n_vec.crossVectors(vec0,vec1).normalize();
            geometry.faces.push(new THREE.Face3(offset(x,y),offset(x+1,y),offset(x,y+1), n_vec, [colors[offset(x,y)],colors[offset(x+1,y)],colors[offset(x,y+1)]]));
            geometry.faces.push(new THREE.Face3(offset(x,y),offset(x,y+1),offset(x+1,y), n_vec.negate(), [colors[offset(x,y)],colors[offset(x,y+1)],colors[offset(x+1,y)]]));
            // the other one
            vec0.subVectors(geometry.vertices[offset(x+1,y)],geometry.vertices[offset(x+1,y+1)]);
            vec1.subVectors(geometry.vertices[offset(x,y+1)],geometry.vertices[offset(x+1,y+1)]);
            n_vec.crossVectors(vec0,vec1).normalize();
            geometry.faces.push(new THREE.Face3(offset(x+1,y),offset(x+1,y+1),offset(x,y+1), n_vec, [colors[offset(x+1,y)],colors[offset(x+1,y+1)],colors[offset(x,y+1)]]));
            geometry.faces.push(new THREE.Face3(offset(x+1,y),offset(x,y+1),offset(x+1,y+1), n_vec.negate(), [colors[offset(x+1,y)],colors[offset(x,y+1)],colors[offset(x+1,y+1)]]));
        }
    }

    var material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
//    mesh.rotation.x -= Math.PI/3;
    scene.add(mesh);
    var cube = new THREE.Mesh(new THREE.CubeGeometry(10,10,10,10,10,10), new THREE.MeshPhongMaterial({color: 0x42aaff}));
    cube.position.y = 20;
    cube.position.x = -10;
    cube.position.z = 5;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    var geometry_for_sphere = new THREE.SphereGeometry( 5, 32, 32 );
    var sphere = new THREE.Mesh( geometry_for_sphere,  new THREE.MeshPhongMaterial({color: 0x42aaff}));
    sphere.position.y = -20;
    sphere.position.x = 10;
    sphere.position.z = 5;
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );
}

function getColor(max,min,val){
    var color = new THREE.Color();
    if(val = 1){
        color.setRGB(max,min,val);
    }else{
    color.setRGB(max,min,val*0.1);
    }

    return color;
}

function initWireframe(){
}

function initData(){
    var BIGIN=-10, END=10;
    var data = new Array();
    for(var x=BIGIN;x<END;x++){
        var row = [];
        for(var y=BIGIN;y<END;y++){
            if(((x<0)&&(y>0)) || ((x>0)&&(y<0)))
                row.push({x: 0, y: 0, z: 0})
            else{
                z = Math.sqrt(x*y);
                row.push({x: x, y: y, z: z});
            }
        }
    data.push(row);
    }
    return data;
    console.log(data);
}
var angle = 1;
var angle_light = 1.5;

function animate(){
    requestAnimationFrame(animate);

        camera.position.x = radius*Math.sin(angle*Math.PI/180);
        camera.position.z = radius*Math.cos(angle*Math.PI/180);
        angle += 1;
        camera.lookAt(scene.position);
        var time = Date.now() * 0.0005;
        light1.position.x = Math.sin( time * 0.7 ) * 30;
		light1.position.y = Math.cos( time * 0.5 ) * 40;
		light1.position.z = Math.cos( time * 0.3 ) * 30;
        light2.position.x = Math.cos( time * 0.3 ) * 30;
		light2.position.y = Math.sin( time * 0.5 ) * 40;
		light2.position.z = Math.sin( time * 0.7 ) * 30;
		light3.position.x = Math.sin( time * 0.7 ) * 30;
		light3.position.y = Math.cos( time * 0.3 ) * 40;
		light3.position.z = Math.sin( time * 0.5 ) * 30;
		light4.position.x = Math.sin( time * 0.3 ) * 30;
		light4.position.y = Math.cos( time * 0.7 ) * 40;
		light4.position.z = Math.sin( time * 0.5 ) * 30;
        //console.log(camera.position.x + "  " + camera.position.z);
        // light.position.x = lpx*Math.cos(-(angle_light*Math.PI/180));
        // light.position.z = lpx*Math.sin(angle_light*Math.PI/180);
        // angle_light += 1.5;
    render();
    //controls.update();
}

function render(){
    renderer.render(scene, camera);
}
