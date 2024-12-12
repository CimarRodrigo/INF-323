import { Vector3 } from './clases.js';
/***************************************************************************/
/* Transformación de las Matrices                                          */
/***************************************************************************/

/* Convierte de grados a radianes */
export function toRadians(grados) {
  return grados * Math.PI / 180;
};

/* Matriz Identidad */
export function identidad(r) {
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
}

/* Traslación - glTranslatef */
export function traslacion(matriz, tx, ty, tz) {
  let r = new Array(16);
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = tx;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = ty;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = tz;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Escalación - glScalef */
export function escalacion(matriz, sx, sy, sz) {
  let r = new Array(16);
  r[0] = sx; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = sy; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = sz; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Rotación sobre X - glRotatef */
export function rotacionX(matriz, theta) {
  let r = new Array(16);
  let c = Math.cos(toRadians(theta));
  let s = Math.sin(toRadians(theta));
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = c; r[9] = -s; r[13] = 0;
  r[2] = 0; r[6] = s; r[10] = c; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Rotación sobre Y - glRotatef */
export function rotacionY(matriz, theta) {
  let r = new Array(16);
  let c = Math.cos(toRadians(theta));
  let s = Math.sin(toRadians(theta));
  r[0] = c; r[4] = 0; r[8] = s; r[12] = 0;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = 0;
  r[2] = -s; r[6] = 0; r[10] = c; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Rotación sobre Z - glRotatef */
export function rotacionZ(matriz, theta) {
  let r = new Array(16);
  let c = Math.cos(toRadians(theta));
  let s = Math.sin(toRadians(theta));
  r[0] = c; r[4] = -s; r[8] = 0; r[12] = 0;
  r[1] = s; r[5] = c; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Proyección Paralela - glOrtho */
export function ortho(r, izq, der, abj, arr, cerca, lejos) {
  r[0] = 2 / (der - izq); r[4] = 0; r[8] = 0; r[12] = -(der + izq) / (der - izq);
  r[1] = 0; r[5] = 2 / (arr - abj); r[9] = 0; r[13] = -(arr + abj) / (arr - abj);
  r[2] = 0; r[6] = 0; r[10] = -2 / (lejos - cerca); r[14] = -(lejos + cerca) / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
}

/* Proyección Perspectiva - glFrustum */
export function frustum(r, izq, der, abj, arr, cerca, lejos) {
  r[0] = 2 * cerca / (der - izq); r[4] = 0; r[8] = (der + izq) / (der - izq); r[12] = 0;
  r[1] = 0; r[5] = 2 * cerca / (arr - abj); r[9] = (arr + abj) / (arr - abj); r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = -(lejos + cerca) / (lejos - cerca); r[14] = -2 * lejos * cerca / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = -1; r[15] = 0;
}

/* Proyección Perspectiva - gluPerspective */
export function perspective(r, fovy, aspecto, cerca, lejos) {
  let ang = fovy * 0.5;
  let f = (Math.abs(Math.sin(toRadians(ang))) < 1e-8 ? 0 : 1) / Math.tan(toRadians(ang));
  r[0] = f / aspecto; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = f; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = -(lejos + cerca) / (lejos - cerca); r[14] = -2.0 * lejos * cerca / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = - 1.0; r[15] = 0;
}

/* Multiplicación de matrices de 4 x 4 */
export function multiplica(c, a, b) {
  let r = new Array(16);
  let i, j, k;
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      let s = 0;
      for (k = 0; k < 4; k++)
        s = s + a[i + k * 4] * b[k + j * 4];
      r[i + j * 4] = s;
    }
  }
  for (i = 0; i < 16; i++)
    c[i] = r[i];
}

/* Camara - gluLookAt */
export function lookAt(r, vistaX, vistaY, vistaZ, centroX,
  centroY, centroZ, arribaX, arribaY, arribaZ) {

  let vista = new Vector3(vistaX, vistaY, vistaZ);
  let centro = new Vector3(centroX, centroY, centroZ);
  let arriba = new Vector3(arribaX, arribaY, arribaZ);

  /* n = vista - centro */
  let n = vista.menos(centro);

  /* u = u / || u || */
  n.normaliza();

  /* v = arriba */
  let v = arriba;

  /* v = v / || v || */
  //v.normaliza(); // No es necesario!

  /* u = v x n */
  let u = v.producto_vectorial(n);

  /* u = u / || u || */
  u.normaliza();

  /* Recalcula v: v = n x u */
  v = n.producto_vectorial(u);

  r[0] = u.x; r[4] = u.y; r[8] = u.z; r[12] = -(vistaX * u.x + vistaY * u.y + vistaZ * u.z);
  r[1] = v.x; r[5] = v.y; r[9] = v.z; r[13] = -(vistaX * v.x + vistaY * v.y + vistaZ * v.z);
  r[2] = n.x; r[6] = n.y; r[10] = n.z; r[14] = -(vistaX * n.x + vistaY * n.y + vistaZ * n.z);
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
}
