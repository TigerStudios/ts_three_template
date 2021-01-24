uniform float time;
uniform float increaseValue;
varying vec2 vUv;

void main(){

    gl_FragColor = vec4(vUv,sin(time) * 0.6,1.);

}