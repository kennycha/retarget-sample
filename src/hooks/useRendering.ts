import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

const MAP_TYPES = ['map', 'aoMap', 'emissiveMap', 'glossinessMap', 'metalnessMap', 'normalMap', 'roughnessMap', 'specularMap'];

interface useRenderingProps {
  inputUrl: string | undefined,
  currentBone: THREE.Bone| undefined,
  setCurrentBone: Dispatch<SetStateAction<THREE.Bone | undefined>>
  setTheSkeletonHelper: Dispatch<SetStateAction<THREE.SkeletonHelper | undefined>>
}

export const useRendering = ({inputUrl, currentBone, setCurrentBone, setTheSkeletonHelper} : useRenderingProps) => {
  const [contents, setContents] = useState<any[]>([]);
  const [theScene, setTheScene] = useState<THREE.Scene | undefined>(undefined);

  const createScene = useCallback(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);
    scene.fog = new THREE.Fog(0xbbbbbb, 10, 80);
    return scene;
  }, [])

  const clearRendering = useCallback(({ renderingDiv }) => {
    if (renderingDiv) {
      while (renderingDiv.firstChild) {
        renderingDiv.removeChild(renderingDiv.firstChild);
      }
    }
    contents.forEach((content : any) => {
      // scene에서 삭제
      theScene?.remove(content);
      // content 및 하위 노드들이 mesh라면 geometry 및 material dispose
      content.traverse((node : any) => {
        if (!node.isMesh) return;
        node.geometry.dispose();
        const materials : any = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material : any) => {
          MAP_TYPES.forEach((mapType) => {
            material[mapType]?.dispose();
          });
        });
      });
    });
    setContents([]);
    setTheScene(undefined);
  }, [contents, theScene])

  const createCamera = useCallback(() => {
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 500);
    camera.position.set(-0.2521, 0.14948, 3.2656);
    return camera;
  }, [])

  const createRenderer = useCallback(() => {
    const renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    return renderer;
  }, [])

  const addLights = useCallback(({ scene }) => {
    const hemiLight = new THREE.HemisphereLight(0xAAAAAA);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.54)
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1000, 1000);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    const d = 8.25;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);
  }, [])

  const addGround = useCallback(({ scene, camera, renderer }) => {
    const texture = new THREE.TextureLoader().load(
      'texture/texture_01.png',
      () => { renderer.render(scene, camera) }
    )
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(300, 300);
    
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({
        color: 0xbbbbbb,
        map: texture,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    groundMesh.position.set(0, 0, 0);
    groundMesh.rotation.x = -Math.PI / 2;
    // groundMesh.rotation.x = -Math.PI;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    setContents((prevContents) => ([...prevContents, groundMesh]));

    const xMaterial = new THREE.LineBasicMaterial({ color: '#EA2027' });
    const yMaterial = new THREE.LineBasicMaterial({ color: '#0652DD' });
    const zMaterial = new THREE.LineBasicMaterial({ color: '#00A868' });

    const xPoints = [new THREE.Vector3(-500, 0, 0), new THREE.Vector3(500, 0, 0)];
    const yPoints = [new THREE.Vector3(0, 0, -500), new THREE.Vector3(0, 0, 500)];
    const zPoints = [new THREE.Vector3(0, -500, 0), new THREE.Vector3(0, 500, 0)];

    const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
    const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
    const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);

    const xLine = new THREE.Line(xGeometry, xMaterial);
    const yLine = new THREE.Line(yGeometry, yMaterial);
    const zLine = new THREE.Line(zGeometry, zMaterial);

    scene.add(xLine, yLine, zLine);
    setContents((prevContents) => ([...prevContents, xLine, yLine, zLine]));
  }, [])

  const createCameraControls = useCallback(({ camera, renderer }) => {
    const cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);
    cameraControls.update();
    cameraControls.enabled = true;
    cameraControls.enablePan = true;
    cameraControls.maxDistance = 100;
    cameraControls.minZoom = 1.0001;
    return cameraControls;
  }, [])

  const createTransformControls = useCallback(({ scene, camera, renderer, cameraControls }) => {
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.mode = 'rotate'
    transformControls.addEventListener('change', () => {
      renderer.render(scene, camera);
    });
    transformControls.addEventListener('dragging-changed', (event) => {
      cameraControls.enabled = !event.value;
    });
    scene.add(transformControls);
    return transformControls;
  }, [])
  
  const addModel = ({ scene, object } : { scene: THREE.Scene, object: any}) => {
    object.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
    const model = object.scene;
    scene.add(model);
    return model;
  };

  const addSkeletonHelper = ({ scene, model } : { scene: THREE.Scene, model: any}) => {
    const skeletonHelper = new THREE.SkeletonHelper(model);
    skeletonHelper.visible = true;
    scene.add(skeletonHelper);
    setTheSkeletonHelper(skeletonHelper)
    return skeletonHelper;
  };

  const addJointMeshes = useCallback(({
    skeletonHelper, camera, renderer, cameraControls, transformControls
  } : {
    skeletonHelper: THREE.SkeletonHelper, camera: THREE.PerspectiveCamera, renderer: THREE.WebGL1Renderer, cameraControls: OrbitControls, transformControls: TransformControls
  }) => {
    skeletonHelper.bones.forEach((bone) => {
      // bone.matrixAutoUpdate = false;
      const boneMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        opacity: 0.5,
        transparent: true 
      })
      boneMaterial.depthWrite = false;
      boneMaterial.depthTest = false;
      const boneGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
      const boneMesh = new THREE.Mesh(boneGeometry, boneMaterial);
      bone.add(boneMesh);
    })

    const dragControls = new DragControls(skeletonHelper.bones, camera, renderer.domElement);
    dragControls.addEventListener('hoveron', () => {
      cameraControls.enabled = false;
    });
    dragControls.addEventListener('hoveroff', () => {
      cameraControls.enabled = true;
    });
    dragControls.addEventListener('dragstart', (event) => {
      const bone = event.object.parent
      bone.matrixAutoUpdate = true;
      if (bone !== currentBone) {
        setCurrentBone(bone)
      }
      transformControls.attach(event.object.parent);
      dragControls.enabled = false;
    });
    dragControls.addEventListener('dragend', (event) => {
      // dragControls.enabled = true;
      // const bone = event.object.parent
      // bone.matrixAutoUpdate = false;
    });
    dragControls.addEventListener('dragging-changed', (event) => {
      cameraControls.enabled = !event.value;
    });
  }, [currentBone, setCurrentBone]);

  const resizeRendererToDisplaySize = ({ renderer } : { renderer: THREE.WebGL1Renderer }) => {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      const renderingDiv = document.getElementById('renderingDiv');
      renderer.setSize(renderingDiv?.clientWidth ?? 0, renderingDiv?.clientHeight ?? 0, false)
    }
    return needResize;
  }

  useEffect(() => {
    const renderingDiv = document.getElementById('renderingDiv');
    if (renderingDiv) {
      const scene = createScene();
      setTheScene(scene)
      const camera = createCamera()
      const renderer = createRenderer();
      addLights({ scene });
      addGround({ scene, camera, renderer });
      const cameraControls = createCameraControls({ camera, renderer });
      const transformControls = createTransformControls({ scene, camera, renderer, cameraControls })
      setContents((prevContents) => ([...prevContents, transformControls]));
      if (inputUrl) {
        const loader = new GLTFLoader();
        loader.load(inputUrl, (object) => {
          const model = addModel({ scene, object });
          setContents((prevContents) => ([...prevContents, model]));
          const skeletonHelper = addSkeletonHelper({ scene, model });
          setContents((prevContents) => ([...prevContents, skeletonHelper]));
          addJointMeshes({ skeletonHelper, camera, renderer, cameraControls, transformControls });
          
          console.log('object: ', object);
          console.log('skeletonHelper: ', skeletonHelper);
        })
      }
  
      renderingDiv.appendChild(renderer.domElement);
  
      const update = () => {
        if (resizeRendererToDisplaySize({ renderer })) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(update);
      }
  
      update();
  
      return () => {
        clearRendering({ renderingDiv });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputUrl])
}
