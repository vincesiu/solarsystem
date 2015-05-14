

var canvas;
var gl;

//Triangle setup
//////////////////
//////////////////
var numTimesToSubdivide = 3;
var index = 0;
var pointsArray = [];
var normalsArray = [];

//The above variables are loaded into these for different 
//complexities of triangles
/////////////////
/////////////////
var bufferListNormal = [];
var bufferListVertex = [];
var bufferListIndex = [];


//Tetrahedron initial coords
///////////////////
///////////////////
var va = vec4(0.57735, 0.57735, 0.57735, 1);
var vb = vec4(0.57735, -0.57735, -0.57735, 1);
var vc = vec4(-0.57735, 0.57735, -0.57735, 1);
var vd = vec4(-0.57735, -0.57735, 0.57735, 1);




//Camera Movement Initialization
////////////////////
////////////////////
var moveRot = 0;
var moveDir = [0, 0, 0];
var FOV = 45;
var initialZOffset = -50.0;

//Camera Initialization Options
////////////////////
////////////////////
var coords_camoffset = [0.0, 0.0, initialZOffset];
var theta_camoffset = 30;
var mooncam_Matrix;
var mooncam_rotate = 0.0;
var mooncam_active = false;
var mooncam_theta;

//CHANGE THE INITIAL ATTACHED CAM COORDS HERE.
//If you put in the coords as too close to zero, you might end up inside the planet though
//////////////////
//////////////////
var coords_mooncamx = -2.0;
var coords_mooncamy = -2.0;

//Geometry stuff
////////////////////
////////////////////
///Note for geometry: only complexities 2 <= x <= 5 allowed
///
///Suns
//////////
//////////
var coords_sun = [0.0, 0.0, 3.0];
var scale_sun = 1.0;
var complexity_sun = 4;
var modelMatrix_sun = scale(1.0, 1.0, 1.0);


///Planets
///////////
///////////
var numPlanets = 4;

var coords_planet = [
6.0,
9.0,
12.0,
18.0
];
var scale_planet = [
0.3,
0.4,
0.35,
0.7
];
var rotate_planet = [
0.9,
0.5,
1.3,
0.3
];
var complexity_planet = [
1,
3,
4,
3
];
var materials_planet = [
{"ambient":vec4(1.0, 1.0, 1.0, 1.0), "diffuse":vec4(0.8, 0.8, 0.8, 1.0), "specular":vec4(1.0, 1.0, 1.0, 1.0), "shininess":1.1}, 
{"ambient":vec4(0.1, 1.0, 0.2, 1.0), "diffuse":vec4(0.1, 0.8, 0.2, 1.0), "specular":vec4(0.1, 0.8, 0.2, 1.0), "shininess":10.0}, 
{"ambient":vec4(0.3, 0.3, 0.8, 1.0), "diffuse":vec4(0.1, 0.1, 1.0, 1.0), "specular":vec4(1.0, 1.0, 1.0, 1.0), "shininess":50.0}, 
{"ambient":vec4(0.7, 0.3, 0.1, 1.0), "diffuse":vec4(0.25, 0.10, 0.015, 1.0), "specular":vec4(0.0, 0.0, 0.0, 1.0), "shininess":10.0} 
];
//Moons
//////////////
//////////////
//This offset is relative to the parent planet
var coords_moon = 0.7;
var scale_moon = 0.1;
var rotate_moon = 0.6;
var complexity_moon = 3;
var moon_modelMatrix;
var moon_galaxyMatrix;
var materials_moon = {"ambient":vec4(1.0, 1.0, 1.0, 1.0), "diffuse":vec4(0.8, 0.8, 0.8, 1.0), "specular":vec4(1.0, 1.0, 1.0, 1.0), "shininess":1.1}

complexity_planet.push(complexity_moon);
materials_planet.push(materials_moon);

//Some variables which are used for everything. 
//Don't touch these.
////////////////////////
////////////////////////
var modelMatrix_planet = [];




//Lighting
///////////////
///////////////
var lightPosition = vec4(coords_sun[0], coords_sun[1], coords_sun[2], 1.0);
var lightAmbient = vec4(0.3, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 0.9, 0.8, 0.8, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );








var ambientColor
var diffuseColor
var specularColor;

var modelViewMatrix;
var projectionMatrix;
var viewMatrix;

//Uniform Shader variable stuff
//Attribute pointers as well
////////////////////////
////////////////////////
var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var shininessLoc;
var lightMatrixLoc;
var modelViewMatrixLoc
var projectionMatrixLoc;
var currentPlanetLoc;

var vPosition;
var vNormal;


//My fail attempt at enums in java
//Too lazy to learn real enums
///////////////////////
///////////////////////
var shading_smooth = 0;
var shading_flat = 1;


    


//Sphere Setup Functions
//////////////////////
//////////////////////


function triangle(a, b, c, shading) {
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);
    
     if (shading == shading_flat) {
       var t1 = subtract(a,b);
       var t2 = subtract(c,b);

       var n = vec4(normalize(cross(t1,t2)));
       normalsArray.push(-n[0], -n[1], -n[2], 0.0);
       normalsArray.push(-n[0], -n[1], -n[2], 0.0);
       normalsArray.push(-n[0], -n[1], -n[2], 0.0);
       index += 3;
    } 
    else if (shading == shading_smooth) {
       normalsArray.push(a[0], a[1], a[2], 0.0);
       normalsArray.push(b[0], b[1], b[2], 0.0);
       normalsArray.push(c[0], c[1], c[2], 0.0);
       index += 3;
    }
}


function divideTriangle(a, b, c, count, shading) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1, shading );
        divideTriangle( ab, b, bc, count - 1, shading );
        divideTriangle( bc, c, ac, count - 1, shading );
        divideTriangle( ab, bc, ac, count - 1, shading );
    }
    else { 
        triangle( a, b, c, shading );
    }
}


function tetrahedron(a, b, c, d, n, shading) {
    divideTriangle(a, b, c, n, shading);
    divideTriangle(d, c, b, n, shading);
    divideTriangle(a, d, b, n, shading);
    divideTriangle(a, c, d, n, shading);
}







//Program Initialization
//////////////////////
//////////////////////

window.onload = function init() {

    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    //Initializing the sphere geometry
    //////////////////////
    //////////////////////
    for(var i = 1; i <= 5; i ++)    {
        if (i == 1)
            tetrahedron(va, vb, vc, vd, 2.0, shading_flat);
        else
            tetrahedron(va, vb, vc, vd, i, shading_smooth);
        
        bufferListNormal[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferListNormal[i]);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.DYNAMIC_DRAW);

        bufferListVertex[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferListVertex[i]);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.DYNAMIC_DRAW);

        bufferListIndex[i] = index;


        normalsArray = [];
        pointsArray = [];
        index = 0;
    }

    


    //Lighting business
    /////////////////////////////
    var lightMatrix = 
    [
    lightAmbient,
    lightDiffuse,
    lightSpecular,
    vec4()
    ];

    // ambientProduct = mult(lightAmbient, materialAmbient);
    // diffuseProduct = mult(lightDiffuse, materialDiffuse);
    // specularProduct = mult(lightSpecular, materialSpecular);

    
     //Color
    ////////////////
    ////////////////
    
    




    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    lightMatrixLoc = gl.getUniformLocation(program, "lightMatrix");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    shininessLoc = gl.getUniformLocation(program, "shininess");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    lightPositionLoc = gl.getUniformLocation( program, "lightPosition" );
    currentPlanetLoc = gl.getUniformLocation( program, "curPlanet");

    gl.uniformMatrix4fv( lightMatrixLoc, false, flatten(lightMatrix) );
    modelMatrix_sun = translate(coords_sun[0], coords_sun[1], coords_sun[2]);




    normalsArray = [];
    pointsArray = [];
    index = 0;


    //Planet Model Matrix Initialization
    //////////////////////////////////
    //////////////////////////////////
    for (var i = 0; i < numPlanets; i++) {

        var initialRotation = Math.floor(Math.random() * 360);
        modelMatrix_planet[i] = mult(translate(coords_planet[i], 0, 0), scale(scale_planet[i], scale_planet[i], scale_planet[i]));
        modelMatrix_planet[i] = mult(rotate(initialRotation,0.0,1.0,0.0), modelMatrix_planet[i]);
        modelMatrix_planet[i] = mult(translate(coords_sun[0], coords_sun[1], coords_sun[2]), modelMatrix_planet[i]);


        //Moon and mooncam matrix initialization as well
        ////////////////////////
        ////////////////////////
        if (i == 1) {
            moon_modelMatrix = mult(translate(coords_moon, 0, 0), scale(scale_moon, scale_moon, scale_moon));

            moon_galaxyMatrix = mult(rotate(initialRotation,0.0,1.0,0.0), translate(coords_planet[i], 0, 0));
            moon_galaxyMatrix = mult(translate(coords_sun[0], coords_sun[1], coords_sun[2]), moon_galaxyMatrix);


            mooncam_theta = 90 + Math.atan(-coords_mooncamy / (-coords_mooncamx + coords_planet[i])) * 180 / Math.PI;
            mooncam_Matrix = mult(rotate(-initialRotation, 0.0, 1.0, 0.0), translate(-coords_sun[0], -coords_sun[1], -coords_sun[2]));
            mooncam_Matrix = mult(translate(-coords_planet[i]-coords_mooncamx, 0.0,-coords_mooncamy), mooncam_Matrix);
            }
    }




    modelMatrix_sun = mult(scale(scale_sun, scale_sun, scale_sun), modelMatrix_sun);


    projectionMatrix = perspective(FOV, 960.0/540.0, 1,-20);
    viewMatrix = mult(translate(0, 0, initialZOffset), rotate(theta_camoffset, 1.0, 0.0, 0.0));

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );



    render();
    }
    






function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //Camera Movement code
    ///////////////////////
    ///////////////////////       
    viewMatrix = mult(translate(0,0,1.0),viewMatrix);
    viewMatrix = mult(rotate(moveRot,0,1.0,0), viewMatrix);
    viewMatrix = mult(translate(0,0,-1),viewMatrix);
    viewMatrix = mult(translate(0.0 + 0.25 * moveDir[0], 0.0 + 0.25*moveDir[1], 0.0 + 0.25 * moveDir[2]), viewMatrix);

    for (var i = 0; i < 3; i ++) 
        moveDir[i] = 0;
    moveRot = 0;


    //Light Repositioning
    /////////////////////
    /////////////////////
    var lightPosition_new = [dot(viewMatrix[0], lightPosition), dot(viewMatrix[1], lightPosition), dot(viewMatrix[2], lightPosition), 1.0];
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition_new) ); 


    //This is the rotation computation
    //for the planets, rotating the vertices
    //Also camera and moon stuff
    ///////////////////////
    ///////////////////////
    for (var i = 0; i < numPlanets; i++) {
        modelMatrix_planet[i] = mult(translate(-coords_sun[0], -coords_sun[1], -coords_sun[2]), modelMatrix_planet[i]);
        modelMatrix_planet[i] = mult(rotate(rotate_planet[i], 0.0, 1.0, 0.0), modelMatrix_planet[i]);
        modelMatrix_planet[i] = mult(translate(coords_sun[0], coords_sun[1], coords_sun[2]), modelMatrix_planet[i]);

        //Moon and camera stuff
        //You can change the 1 constant if you want to change the planet
        //////////////
        //////////////
        if (i == 1) {
            moon_galaxyMatrix = mult(translate(-coords_sun[0], -coords_sun[1], -coords_sun[2]), moon_galaxyMatrix);
            moon_galaxyMatrix = mult(rotate(rotate_planet[i], 0.0, 1.0, 0.0), moon_galaxyMatrix);
            moon_galaxyMatrix = mult(translate(coords_sun[0], coords_sun[1], coords_sun[2]), moon_galaxyMatrix);

            moon_modelMatrix = mult(rotate(rotate_moon, 0.0, 1.0, 0.0), moon_modelMatrix);


            mooncam_Matrix = mult(translate(coords_planet[i] + coords_mooncamx, 0.0,  coords_mooncamy), mooncam_Matrix);
            mooncam_Matrix = mult(rotate(-rotate_planet[i], 0.0, 1.0, 0.0), mooncam_Matrix);
            mooncam_Matrix = mult(translate(-coords_planet[i] - coords_mooncamx, 0.0, - coords_mooncamy), mooncam_Matrix);
        }
    }



    //Sun modelling
    ////////////////////////////
    ////////////////////////////
    if (mooncam_active)
        viewMatrix = mult(rotate(- mooncam_theta + mooncam_rotate, 0.0, 1.0, 0.0), mooncam_Matrix);
    
    modelViewMatrix = mult(viewMatrix, modelMatrix_sun);


    gl.bindBuffer( gl.ARRAY_BUFFER, bufferListVertex[complexity_sun]); 
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferListNormal[complexity_sun]);
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniform1f(currentPlanetLoc, 1.0);

    for( var i=0; i < bufferListIndex[complexity_sun]; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    



    //Planet modelling
    ////////////////////////////
    ////////////////////////////

    for(var i = 0; i < numPlanets + 1 ; i++)
    {
        if (mooncam_active)
            viewMatrix = mult(rotate(-mooncam_theta + mooncam_rotate, 0.0, 1.0, 0.0), mooncam_Matrix);
        
        ambientProduct = mult(lightAmbient, materials_planet[i]["ambient"]);
        diffuseProduct = mult(lightDiffuse, materials_planet[i]["diffuse"]);
        specularProduct = mult(lightSpecular, materials_planet[i]["specular"]);

        gl.uniform4fv( ambientProductLoc, flatten(ambientProduct) );
        gl.uniform4fv( diffuseProductLoc, flatten(diffuseProduct) );
        gl.uniform4fv( specularProductLoc, flatten(specularProduct) );   
        gl.uniform1f( shininessLoc, materials_planet[i]["shininess"] );

        gl.bindBuffer( gl.ARRAY_BUFFER, bufferListVertex[complexity_planet[i]]); 
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer( gl.ARRAY_BUFFER, bufferListNormal[complexity_planet[i]])
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

        if (i != numPlanets)
            modelViewMatrix = mult(viewMatrix, modelMatrix_planet[i]);   
        else 
            modelViewMatrix = mult(viewMatrix, mult(moon_galaxyMatrix, moon_modelMatrix));

        gl.uniform1f(currentPlanetLoc, 2.0 + i);


        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        for( var j=0; j < bufferListIndex[complexity_planet[i]]; j+=3) 
            gl.drawArrays( gl.TRIANGLES, j, 3 );
    }



   


    window.requestAnimFrame(render);
}








document.onkeypress = function (event) {
    // console.log(event.key);
    switch(event.key) {
        case "i": //i
            moveDir[2] ++;
            break;
        case "j": //j
            moveDir[0] ++;
            break;
        case "k": //k
            moveDir[0] --;
            break;
        case "m": //m
            moveDir[2] --;
            break;
        case "ArrowUp": //arrowup
            moveDir[1] --;
            break;
        case "ArrowDown": //arrowdown
            moveDir[1] ++;
            break;
        case "ArrowLeft": //arrowleft
            mooncam_rotate -= 2;
            moveRot -= 2;
            break;
        case "ArrowRight": //arrowright
            mooncam_rotate += 2;
            moveRot += 2;
            break;
        case "n": //n
            FOV--;
            break;
        case "w": //i
            FOV++;
            break;
        case "r": //i
            viewMatrix = mult(translate(0, 0, initialZOffset),rotate(theta_camoffset,1.0,0.0,0.0));
            mooncam_active = false;
            mooncam_rotate = 0;
            FOV = 45;
            break;
        case "b":
            if (mooncam_active) 
                viewMatrix = oldviewmatrix;
            else
                oldviewmatrix = viewMatrix;
            mooncam_active = !mooncam_active;
        default:
            break;
    }
}