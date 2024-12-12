import { uColor, modoRenderizado } from './script.js';

export class Material {
  constructor() {
    this.nombre = "si_falta";    /* Nombre del material */
    this.ambiente = [0.2, 0.2, 0.2]; /* Arreglo del color ambiente */
    this.difuso = [0.8, 0.8, 0.8]; /* Arreglo del color difuso */
    this.especular = [0.0, 0.0, 0.0]; /* Arreglo del color especular */
    this.brillo = 0;             /* Exponente del brillo */
  }
  setNombre(nombre) {
    this.nombre = nombre;
  }
  getNombre() {
    return this.nombre;
  }
  setAmbiente(ambiente) {
    this.ambiente = ambiente;
  }
  getAmbiente() {
    return this.ambiente;
  }
  setDifuso(difuso) {
    this.difuso = difuso;
  }
  getDifuso() {
    return this.difuso;
  }
  setEspecular(especular) {
    this.especular = especular;
  }
  getEspecular() {
    return this.especular;
  }
  setBrillo(brillo) {
    this.brillo = brillo;
  }
  getBrillo() {
    return this.brillo;
  }
  toString() {
    return this.nombre +
      "<br> Ka: " + this.ambiente +
      "<br> Kd: " + this.difuso +
      "<br> Ks: " + this.especular +
      "<br> Ns: " + this.brillo;
  }
}

export class Cadena {
  constructor(cadena) {
    this.cadena = cadena;
    this.indice = 0;
  }
  esDelimitador(c) {
    return (
      c == ' ' ||
      c == '\t' ||
      c == '(' ||
      c == ')' ||
      c == '"' ||
      c == "'"
    );
  }
  saltaDelimitadores() {
    let n = this.cadena.length;
    while (this.indice < n &&
      this.esDelimitador(this.cadena.charAt(this.indice))) {
      this.indice++;
    }
  };
  obtLongPalabra(inicio) {
    let i = inicio;
    while (i < this.cadena.length &&
      !this.esDelimitador(this.cadena.charAt(i))) {
      i++;
    }
    return i - inicio;
  };
  getToken() {
    let n, subcadena;
    this.saltaDelimitadores();
    n = this.obtLongPalabra(this.indice);
    if (n === 0) {
      return null;
    }
    subcadena = this.cadena.substr(this.indice, n);
    this.indice = this.indice + (n + 1);
    return subcadena.trim();
  }
  getInt() {
    let token = this.getToken();
    if (token) {
      return parseInt(token, 10);
    }
    return null;
  }
  getFloat() {
    let token = this.getToken();
    if (token) {
      return parseFloat(token);
    }
    return null;
  }
}

export class Objeto {
  constructor(gl, nombreArchivo) {
    let lineas, token, x, y, z, a, b;
    let minX = Number.MAX_VALUE, maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE;
    let minZ = Number.MAX_VALUE, maxZ = Number.MIN_VALUE;
    let numVertices = 0, numTriangulos = 0;
    let indiceDeGrupo, hayGrupos = false;

    this.vertices = [];
    this.indices = [];
    this.grupos = [];
    this.materiales = [];

    // Lee el archivo .obj
    let datos_obj = this.leeArchivo(nombreArchivo);
    lineas = datos_obj.split("\n");

    // Procesa cada línea del archivo .obj
    for (let i = 0; i < lineas.length; i++) {
      let cad = new Cadena(lineas[i]);
      token = cad.getToken();
      if (token != null) {
        switch (token) {
          case '#': continue;
          case 'mtllib':
            let nombreArchivoMTL = cad.getToken();
            this.lee_datos_archivo_mtl(nombreArchivoMTL);
            break;
          case 'v': // vértice
            x = cad.getFloat();
            y = cad.getFloat();
            z = cad.getFloat();
            this.vertices.push(x, y, z);
            numVertices++;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
            break;
          case 'g':
          case 'group': // grupo
            let nombreGrupo = cad.getToken();
            indiceDeGrupo = this.buscaGrupo(nombreGrupo);
            if (indiceDeGrupo === -1) {
              let grupo = new Grupo();
              grupo.setNombre(nombreGrupo);
              this.grupos.push(grupo);
              indiceDeGrupo = this.grupos.length - 1;
            }
            hayGrupos = true;
            break;
          case 'usemtl':
            let nombreMaterial = cad.getToken();
            let indiceDeMaterial = this.buscaMaterial(nombreMaterial);
            if (!hayGrupos) {
              indiceDeGrupo = this.buscaMaterialPorGrupo(indiceDeMaterial);
              if (indiceDeGrupo === -1) {
                let grupo = new Grupo();
                grupo.setNombre(nombreMaterial);
                this.grupos.push(grupo);
                indiceDeGrupo = this.grupos.length - 1;
              }
            }
            this.grupos[indiceDeGrupo].setMaterial(indiceDeMaterial);
            break;
          case 'f': // cara
            a = cad.getInt() - 1;
            this.indices.push(a);
            b = cad.getInt() - 1;
            this.indices.push(b);
            b = cad.getInt() - 1;
            this.indices.push(b);
            this.grupos[indiceDeGrupo].adiTriangulo(numTriangulos);
            numTriangulos++;
            let tokenEntero = cad.getInt();
            while (tokenEntero != null) {
              this.indices.push(a, b);
              b = tokenEntero - 1;
              this.indices.push(b);
              this.grupos[indiceDeGrupo].adiTriangulo(numTriangulos);
              numTriangulos++;
              tokenEntero = cad.getInt();

            }

            break;
        }
      }
    }

    // Calcula el centro y escala del modelo
    let centroX = (minX + maxX) / 2;
    let centroY = (minY + maxY) / 2;
    let centroZ = (minZ + maxZ) / 2;
    let tamMax = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    let escala = 2.0 / tamMax;

    // Ajusta los vértices al centro y escala
    for (let i = 0; i < this.vertices.length; i += 3) {
      this.vertices[i] = (this.vertices[i] - centroX) * escala;
      this.vertices[i + 1] = (this.vertices[i + 1] - centroY) * escala;
      this.vertices[i + 2] = (this.vertices[i + 2] - centroZ) * escala;
    }
  }

  dibuja(gl) {
    let numTriangulos, indiceDeMaterial, color, k;

    for (let i = 0; i < this.grupos.length; i++) {
      numTriangulos = this.grupos[i].getNumTriangulos();
      if (numTriangulos === 0) continue;

      let indAux = new Uint16Array(numTriangulos * 3);
      for (let j = 0; j < numTriangulos; j++) {
        k = j * 3;
        let numTrian = this.grupos[i].getTriangulo(j);
        indAux[k] = this.indices[numTrian * 3];
        indAux[k + 1] = this.indices[numTrian * 3 + 1];
        indAux[k + 2] = this.indices[numTrian * 3 + 2];
      }

      // Configuración del buffer de vértices
      let codigoVertices = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      // Configuración del buffer de índices
      this.codigoDeIndices = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.codigoDeIndices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indAux), gl.STATIC_DRAW);

      // Obtener el material del grupo actual y su color difuso
      indiceDeMaterial = this.grupos[i].getMaterial();
      if (indiceDeMaterial !== -1) {
        color = this.materiales[indiceDeMaterial].getDifuso();
        console.log(`Grupo ${i}: usando color difuso ${color}`); // Depuración del color
      } else {
        console.warn(`Grupo ${i}: no tiene material asignado.`);
        color = [1.0, 1.0, 1.0]; // Color blanco por defecto en caso de que no haya material
      }

      // Asignar el color al shader
      gl.uniform4f(uColor, color[0], color[1], color[2], 1.0);

      gl.drawElements(modoRenderizado, numTriangulos * 3, gl.UNSIGNED_SHORT, 0);

      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
  }

  // Resto de los métodos
  leeArchivo(nombreArchivo) {
    let byteArray = [];
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.status !== 404) {
        byteArray = request.responseText;
      }
    };
    request.open('GET', nombreArchivo, false);
    request.send(null);
    return byteArray;
  }

  lee_datos_archivo_mtl(nombreArchivoMTL) {
    let datos_mtl = this.leeArchivo("Modelos/" + nombreArchivoMTL);
    let lineas = datos_mtl.split("\n");
    let token;
    for (let i = 0; i < lineas.length; i++) {
      let cad = new Cadena(lineas[i]);
      token = cad.getToken();
      if (token != null) {
        switch (token) {
          case '#': continue;
          case 'newmtl':
            let nombreMaterial = cad.getToken();
            let material = new Material();
            material.setNombre(nombreMaterial);
            this.materiales.push(material);
            break;
          case 'Ka':
            let ambiente = [cad.getFloat(), cad.getFloat(), cad.getFloat()];
            this.materiales[this.materiales.length - 1].setAmbiente(ambiente);
            break;
          case 'Kd':
            let difuso = [cad.getFloat(), cad.getFloat(), cad.getFloat()];
            this.materiales[this.materiales.length - 1].setDifuso(difuso);
            break;
          case 'Ks':
            let especular = [cad.getFloat(), cad.getFloat(), cad.getFloat()];
            this.materiales[this.materiales.length - 1].setEspecular(especular);
            break;
          case 'Ns':
            let brillo = cad.getFloat();
            this.materiales[this.materiales.length - 1].setBrillo(brillo);
            break;
        }
      }
    }
  }

  buscaGrupo(nombre) {
    for (let i = 0; i < this.grupos.length; i++)
      if (nombre === this.grupos[i].getNombre()) return i;
    return -1;
  }

  buscaMaterial(nombre) {
    for (let i = 0; i < this.materiales.length; i++)
      if (nombre === this.materiales[i].getNombre()) return i;
    return -1;
  }

  buscaMaterialPorGrupo(indice) {
    for (let i = 0; i < this.grupos.length; i++)
      if (indice === this.grupos[i].getMaterial()) return i;
    return -1;
  }
}

export class Grupo {
  constructor() {
    this.nombre = "si_falta";       /* Nombre del grupo */
    this.triangulos = new Array();  /* Arreglo de índice de triangulos */
    this.material = 0;              /* Indice del color del material del grupo */
  }
  setNombre(nombre) {
    this.nombre = nombre;
  }
  getNombre() {
    return this.nombre;
  }
  adiTriangulo(t) {
    this.triangulos.push(t);
  }
  getTriangulo(indice) {
    return this.triangulos[indice];
  }
  getNumTriangulos() {
    return this.triangulos.length;
  }
  setMaterial(material) {
    this.material = material;
  }
  getMaterial() {
    return this.material;
  }
  toString() {
    return this.nombre +
      "<br> triangulos: " + this.triangulos +
      "<br> material  : " + this.material;
  }
}
