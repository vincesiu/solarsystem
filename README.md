# vincesiu-a2
Assignment 2: 
NOTE: Please turn up the brightness on your monitor! I did some rough distance attenuation for the light, so it's slightly hard to see my fourth planet. I only used a d^2 variable, I was too lazy to do the whole (a + bd + cd^2) fine tuning

REQUIRED TASKS:
1. Implemented with nice comments and a README for the grader
2. Setup the basic HTML canvas with the correct size, enabled the depth buffer, cleared the the background color to black, and the shaders compile.
3. Used the set of functions in the book to generate the spheres (tetrahedron, triangle, and divideTriangle)
4. Extended the sphere function so that it generated normal vectors for shading, and I added a function parameter which could toggle whether the vectors are for flat or smooth shading
5. Finished it! You can play around with options in the Goemetry Stuff section. Not enough time to do the sun size color thing, and I also didn't understand what it meant
6. Finished it! 4 sad, non texture mapped planets!!
7. Yeah, this was done in 6, in the last project it was difficult to figure out where to optimize these things, but coming into this project, most often it's an intuitive decision. IMO, we save the matrics in the CPU (since I don't know if the GPU can hold the old matrices so I can apply a new transformation matrix to them...) and do all the shading in the shaders. I prefer offloading everything into the GPU because although it's difficult (ugh, gl.uniformVariables) it also provides a speed optimization
8. Reimplemented. See below for controls

EXTRA CREDIT:
1. Created a moon orbiting around planet 2
2. See below for the key. Look at the Camera Initialization Options at the top of my js file to change up the initial coordinates of the camera! 
3. Managed code development using github!
4. Turned it in late Q___Q

CONTROLS:
-i: forward
-m: back
-j: left
-k: right
-arrow up: up
-arrow down: down

-arrow left: turn left
-arrow right: turn right

-n: decrease FOV
-w: increase FOV

-r: Resets the camera to the original camera view
-b: Attaches the camera to the second planet! oooh! 