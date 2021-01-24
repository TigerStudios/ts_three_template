uniform float increaseValue;
varying  vec2 vUv;

void main(){

    gl_FragColor = vec4(vUv,sin(increaseValue) * 0.6,1.);

}