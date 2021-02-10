# Retarget 관련 테스트용 샘플

## 1. 페이지구성

### File Input

- 파일 선택 버튼을 클릭해 3D 모델 파일을 입력합니다.
- 본 샘플은 `.glb` 형식만 지원합니다.
- Player, Dying, Hiphop, Samba 모델에 대한 축 / 형식 구분 파일들은 공유 드라이브에 저장되어 있습니다.
- 추가적으로 리타게팅을 거친 후 glb 형식으로 추출한 파일 또한 해당 드라이브에 업로드할 예정입니다.

### Rendering Canvas

- 입력된 3D 모델 파일을 로드한 후 시각화합니다.

- 베타 앱과 아래의 조작법 차이가 있습니다.

  1) 카메라 rotate : 마우스 좌클릭

  2) 카메라 pan : ctrl + 마우스 좌클릭

  3) 카메라 zoom : 마우스 휠

  4) transfromControls 의 모드가 `rotate` 로 고정되어 있습니다.

  5) 단축키 없음

### Bone Data List

- Rendering Canvas 에서 Bone 을 클릭하면 Current Bone 이 변경됩니다.
- 버튼을 통해 matrix / matrixWorld 간 변경이 가능합니다.
  - 버튼 클릭 시, 클릭 시의 matrix 혹은 matrixWorld 배열의 값들을 페이지 내에서 확인할 수 있습니다.
- `Toggle AutoUpdate` 버튼을 클릭해, Current Bone 의 `matrixAutoUpdate` 값을 변경할 수 있습니다.
  - `matrixAutoUpdate === true`  일 때는, transformControls 를 통한 회전값 조작이 가능합니다.
  - `matrixAutoUpdate === false` 일 때는, 개발자 도구를 통한 matrix 값 변경이 가능합니다.
  - `matrixAutoUpdate === false` 을 기본값으로 가집니다.

### 애니메이션 조작 버튼

- 구현 예정입니다. 
- 재생 / 정지를 하나의 버튼으로 조작합니다.
- 특정 시점 이동 기능은 구현하지 않고, 정지 시 가장 처음 시점으로 이동합니다.

## 2. 테스트 방법

- 개발자 도구의 Console 탭을 함께 사용합니다.
- 3D 모델 로드 시, 로드한 모델의 `object` 와 `skeletonHelper` 가 콘솔에 찍힙니다.
  - object 의 animations field 를 통해 해당 모델이 가진 모션을 확인할 수 있습니다.
  - skeletonHelper 의 bones field 를 통해 해당 모델이 가진 모든 Bone 을 확인할 수 있습니다.
- Bone 선택 시, `currentBone` 과 `currentBone 의 matrix 혹은 matrixWorld` 가 콘솔에 찍힙니다.
  - currentBone 의 matrix 혹은 matrixWorld 값을 직접 변경해, RenderingCanvas 에 있는 3D 모델을 조작할 수 있습니다. 
  - 이때 AutoUpdate 값은 false 여야 하며, 이 값은 currentBone 의 matrixAutoUpdate field 의 값과 동일합니다.