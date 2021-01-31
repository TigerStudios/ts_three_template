import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { JTS, JTS as _ } from '../vendor/JTS/jts.service';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

export class Paint{

    static TIME: number = 0.01;
    static INCREASE_VALUE: number = 0.01;

    //THREE
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private geometry: any;
    private material:any;
    private mesh: any;
    private renderer: THREE.WebGLRenderer; 
    private cameraControls: OrbitControls;
    private gui: GUI;

    //Elements
    private stage: any;

    //Various
    private animation: boolean = true;
    private time: number = 0.;
    private increaseValue: number = 0.;

    constructor(){

        this.stage = _('#paint-box');
        this.init();

    }

    init(){

        //Scene
        this.setScene();

        //Model
        this.setModel()

        //Renderer
        this.setRenderer();

        //Controls
        this.setControls();

        //Gui
        this.setGui();

        //Listeners
        this.listeners();

        this.scene.add(this.mesh);
        this.render();

    }

    listeners(){

        const self = this;

        _(window).bind('resize',() => self.resize());

    }

    render(){

        this.renderer.render(this.scene,this.camera);

        if(this.animation){

            this.time += Paint.TIME;
            this.increaseValue += Paint.INCREASE_VALUE;

            this.material.uniforms.time.value = this.time;
            this.material.uniforms.increaseValue.value = this.increaseValue;

            requestAnimationFrame(() => this.render());

        }

    }

    resize(){
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    setControls(){
        
        this.cameraControls = new OrbitControls( this.camera, this.renderer.domElement );
        //this.cameraControls.addEventListener( 'change', () => this.render() );

    }

    setGui(){

        const self = this;

        this.gui = new GUI();

        const params = {

           increaseValue : self.increaseValue

        };

        this.gui.add( params, 'increaseValue', 0., 200. ).onChange( function ( val: number ) {

            self.increaseValue = val;

        } );


    }

    setModel(){

        let uniforms = {
            increaseValue : { value : 0.},
            time  : { value : 0.}
        };

        this.geometry = new THREE.PlaneBufferGeometry(10,10,10,10);
        this.material = new THREE.ShaderMaterial({
           vertexShader,
           fragmentShader,
           uniforms,
           side : THREE.DoubleSide
           //wireframe : true
        });

        this.mesh = new THREE.Mesh(this.geometry,this.material);

    }

    setRenderer(){

        this.renderer = new THREE.WebGLRenderer({

            antialias : true,
            powerPreference : 'high-performance',
            alpha : false,
    
        });

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.stage.append(this.renderer.domElement);

    }

    setScene(){

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,0.01,10000);
        this.camera.position.set(0,0,30);
        this.camera.lookAt(new THREE.Vector3());

    }


    //Utilities
    static toRadians(deg: number){

        return deg * (Math.PI / 180);

    }

}
