import { ortho, identidad, traslacion } from './matriz.js';

let gl;
let programaID;

let textura1;
let codigoDeTextura1;

let textura2;
let codigoDeTextura2;

let textura3;
let codigoDeTextura3;

let textura4;
let codigoDeTextura4;

let uMatrizProyeccion;
let uMatrizVista;
let uMatrizModelo;
let uUnidadDeTextura;
let uMatrizTextura; //

let uColor;

let MatrizProyeccion = new Array(16);
let MatrizVista = new Array(16);
let MatrizModelo = new Array(16);
let MatrizTextura = new Array(16);

let colision = false;
let estaAbierto = false;


const compilaEnlazaLosShaders = () => {

  let shaderDeVertice = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shaderDeVertice, document.getElementById("vs").text.trim());
  gl.compileShader(shaderDeVertice);
  if (!gl.getShaderParameter(shaderDeVertice, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shaderDeVertice));
  }

  let shaderDeFragmento = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shaderDeFragmento, document.getElementById("fs").text.trim());
  gl.compileShader(shaderDeFragmento);
  if (!gl.getShaderParameter(shaderDeFragmento, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shaderDeFragmento));
  }

  programaID = gl.createProgram();
  gl.attachShader(programaID, shaderDeVertice);
  gl.attachShader(programaID, shaderDeFragmento);
  gl.linkProgram(programaID);
  if (!gl.getProgramParameter(programaID, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(programaID));
  }
}

class Rectangulo {
  /*
   *       vertices            coord_textura
   *   x1,y2      x2,y2      u1,v2       u2,v2
   *      ----------            ---------- 
   *     |        / |          |        / | 
   *     |      /   |          |      /   | 
   *     |    /     |          |    /     |
   *     | /        |          | /        |
   *      ----------            ---------- 
   *   x1,y1      x2,y1      u1,v1       u2,v1
   */
  constructor(gl, x1 = -2, y1 = -2, x2 = 2, y2 = 2, u1 = 0, v1 = 0, u2 = 1, v2 = 1, posX = 0, posY = 0) {

    let vertices = [
      x1, y1, // 0,
      x2, y1, // 1,
      x2, y2, // 2,
      x1, y2, // 3,
    ];


    let coord_textura = [
      u1, v1, // 0,
      u2, v1, // 1,
      u2, v2, // 2,
      u1, v2, // 3,
    ];

    this.rectanguloVAO = gl.createVertexArray();
    this.posY = posY;
    this.posX = posX;
    this.ctx = 0;
    this.cty = 1;
    this.coord_textura = coord_textura;
    this.tamX = x2;
    this.tamY = y2;




    gl.bindVertexArray(this.rectanguloVAO);

    let codigoVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


    let codigoCoordenadasDeTextura = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, codigoCoordenadasDeTextura);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.coord_textura), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


  }

  muestra(gl) {

    gl.bindVertexArray(this.rectanguloVAO);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);
  }

  actualizaAnimacion() {
    //this.ctx += 1 / 4;
    //this.posY -= 0.1;
    if (this.ctx > 1) this.ctx = 1 / 4;

  }
}

const keyDown = (event) => {
  document.body.addEventListener("keydown", (e) => {
    const audio = document.getElementById("audio");
    audio.play();
  });


  if (event.key == "ArrowRight") {
    textura1.posX += 0.1;
    textura1.ctx += 1 / 4;
    textura1.cty = 2 / 4;
    if (estaColisionando(textura1, textura4)) {
      textura1.posX -= 0.1;
    }
  }
  if (event.key == "ArrowLeft") {
    textura1.posX -= 0.1;
    textura1.ctx += 1 / 4;
    textura1.cty = 3 / 4;
    if (estaColisionando(textura1, textura4)) {
      textura1.posX += 0.1;
    }
  }
  if (event.key == "ArrowUp") {
    textura1.posY += 0.1;
    textura1.ctx += 1 / 4;
    textura1.cty = 1 / 4;
    if (estaColisionando(textura1, textura4)) {
      textura1.posY -= 0.1;
    }
  }
  if (event.key == "ArrowDown") {
    textura1.posY -= 0.1;
    textura1.ctx += 1 / 4;
    textura1.cty = 1
    if (estaColisionando(textura1, textura4)) {
      textura1.posY += 0.1;
    }
  }
}


const dibuja = (textura, codigoDeTextura, tras = false, trasTex = false, posTexX = 0, posTexY = 0, esSprite = true, tiempoCompletado = false) => {


  identidad(MatrizModelo);
  if (tras) traslacion(MatrizModelo, textura.posX, textura.posY, 0);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  identidad(MatrizTextura);
  if (trasTex) traslacion(MatrizTextura, textura.ctx, textura.cty, 0);
  else traslacion(MatrizTextura, posTexX, posTexY, 0);
  gl.uniformMatrix4fv(uMatrizTextura, false, MatrizTextura);

  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  textura.muestra(gl);

  if (esSprite && tiempoCompletado) {
    textura.actualizaAnimacion();
  }
}

const estaColisionando = (rectangulo1, rectangulo2) => {
  let x1 = rectangulo1.posX - rectangulo1.tamX / 2;
  let x2 = rectangulo1.posX + rectangulo1.tamX / 2;
  let x3 = rectangulo2.posX - rectangulo2.tamX / 2;
  let x4 = rectangulo2.posX + rectangulo2.tamX / 2;

  let y1 = rectangulo1.posY - rectangulo1.tamY / 2;
  let y2 = rectangulo1.posY + rectangulo1.tamY / 2;
  let y3 = rectangulo2.posY - rectangulo2.tamY / 2;
  let y4 = rectangulo2.posY + rectangulo2.tamY / 2;

  if (x3 < x2 && x1 < x4 && y3 < y2 && y1 < y4) {
    colision = true;
    if (!estaAbierto) {
      let audio = document.getElementById("pokebola_sonido");
      audio.play();
    }
    estaAbierto = true;
    return true;

  }

  return false;
}

const leeLaTextura = (gl, ID_del_archivo, codigoDeTextura) => {

  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  let imagen = document.getElementById(ID_del_archivo);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagen);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.bindTexture(gl.TEXTURE_2D, null);
}


const dibujaEscena = () => {
  //gl.clear(gl.COLOR_BUFFER_BIT);

  if (colision) {
    dibuja(textura2, codigoDeTextura2, false, 0, 0, false, 0, 0, false);
    dibuja(textura1, codigoDeTextura1, true, true, 0, 0, true, true);
    dibuja(textura3, codigoDeTextura3, true, true, 0, 0, true, true);
  } else {
    dibuja(textura2, codigoDeTextura2, false, 0, 0, false, 0, 0, false);
    dibuja(textura1, codigoDeTextura1, true, true, 0, 0, true, true);
    dibuja(textura4, codigoDeTextura4, true, true, 0, 0, true, false);
  }


  requestAnimationFrame(dibujaEscena);
}

const main = () => {
  let canvas = document.getElementById("webglcanvas");
  document.addEventListener("keydown", keyDown);

  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("WebGL 2.0 no está disponible en tu navegador");
    return;
  }
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  compilaEnlazaLosShaders();

  textura1 = new Rectangulo(gl, -0.8, -0.8, 0.8, 0.8, 0, 3 / 4, 1 / 4, 1, -0.2, -2);
  codigoDeTextura1 = gl.createTexture();
  leeLaTextura(gl, "rojo", codigoDeTextura1);

  textura2 = new Rectangulo(gl, -5, -5, 5, 5);
  codigoDeTextura2 = gl.createTexture();
  leeLaTextura(gl, "fondo", codigoDeTextura2);

  textura3 = new Rectangulo(gl, -0.7, -0.7, 0.7, 0.7, 0, 3 / 4, 1 / 4, 1, -0.2, 1.2);
  codigoDeTextura3 = gl.createTexture();
  leeLaTextura(gl, "pikachu", codigoDeTextura3);

  textura4 = new Rectangulo(gl, -0.3, -0.3, 0.3, 0.3, 0, 0, 1, 1, -0.2, 1.2);
  codigoDeTextura4 = gl.createTexture();
  leeLaTextura(gl, "pokebola", codigoDeTextura4);


  gl.useProgram(programaID);


  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  uUnidadDeTextura = gl.getUniformLocation(programaID, "uUnidadDeTextura");
  uMatrizTextura = gl.getUniformLocation(programaID, "uMatrizTextura");
  uColor = gl.getUniformLocation(programaID, "uColor");

  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);

  gl.enable(gl.BLEND); // Habilita la mezcla de colores
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Función de mezcla

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.activeTexture(gl.TEXTURE0);

  dibujaEscena();


}

main();
