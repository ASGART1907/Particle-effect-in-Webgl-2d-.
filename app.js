const canvas = document.querySelector("canvas");
const gl = canvas.getContext('webgl');

if(!gl){
  alert("YOUR BROWSER IS NOT SUPPORTING WEBGL");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl.viewport(0,0,canvas.width,canvas.height);

const vertexShaderCode = `
attribute vec4 a_position;

uniform vec2 u_resolution;

void main() {
   vec2 zeroToOne = a_position.xy / u_resolution;

   vec2 zeroToTwo = zeroToOne * 2.0;

   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}`;

const fragmentShaderCode = `
   precision mediump float;

   uniform vec4 u_color;

   void main(){
      gl_FragColor = u_color;
   }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader,vertexShaderCode);
gl.shaderSource(fragmentShader,fragmentShaderCode);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
  console.error("VERTEXSHADER ERROR",gl.getShaderInfoLog(vertexShader));
}

if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
  console.error("FRAGMENT SHADER ERROR",gl.getShaderInfoLog(fragmentShader));
}

const program = gl.createProgram();
gl.attachShader(program,vertexShader);
gl.attachShader(program,fragmentShader);

gl.linkProgram(program);
gl.useProgram(program);

var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

// look up uniform locations
var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.enableVertexAttribArray(positionAttributeLocation);

gl.vertexAttribPointer(
    positionAttributeLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    0,
    0
);

const color = gl.getUniformLocation(program,"u_color");

gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

const particles = [];

class Rect{
  constructor({position,velocity,width,height,color}){
      this.position = position;
      this.velocity = velocity;
      this.width = width;
      this.height = height;
      this.color = color;
  }

  draw(){

    gl.uniform4f(color,...this.color);

    var x1 = this.position.x;
    var x2 = this.position.x + this.width;
    var y1 = this.position.y;
    var y2 = this.position.y + this.height;
   
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2]), gl.STATIC_DRAW);  

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  update(){
      this.draw();

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      this.width -= 0.9;
      this.height -= 0.9;
  }
}

canvas.addEventListener("mousemove",(e) => createParticle(e));

function createParticle(e){
  for(let i=0; i<2; i++){
    const size = Math.floor(Math.random() * 20 + 20);
    particles.push(
      new Rect({
          position:{
              x:e.clientX - size / 2,
              y:e.clientY - size / 2
          },
          velocity:{
            x:(Math.random() - 0.5) * 5,
            y:(Math.random() - 0.5) * 5
          },
          width:size,
          height:size,
          color:[Math.random(),Math.random(),Math.random(),Math.random(),1]
      })
  )
  }
}

function animate(){
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  particles.forEach((particle,index) => {
    particle.update();

    particle.position.x += 0.6;

    if(particle.width <= 0.1 || particle.height <= 0.1){
      setTimeout(() => {
        particles.splice(index,1);
      },0)
    }
  });

  requestAnimationFrame(animate);
}

animate();

