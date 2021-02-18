import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import * as THREE from 'three';
import { useRendering } from 'hooks/useRendering';
import { SkeletonHelper } from 'three';

const Title = styled.div`
  margin-top: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
`

const FileInputContainer = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
`

const FileInput = styled.input`
`

const InfoBoxContainer = styled.ul`
  width: 400px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  margin-block-start: 0px;
  margin-block-end: 0px;
  padding-inline-start: 0px;
`

const InfoBox = styled.li`

`

const MainContainer = styled.div`
  margin-top: 30px;
  height: 800px;
  width: 100%;
  display: flex;
  justify-content: center;
`

const RenderingPanel = styled.div`
  width: 1200px;
  height: 800px;
  border: 1px solid black;
  margin-right: 100px;
`

const InputGroup = styled.li`
  width: 500px;
  list-style: none;
  display: flex;
  flex-direction: column;
`

const BoneTitle = styled.div`
  height: 50px;
  font-size: 1.2rem;
`

const ButtonGroup = styled.ul`
  height: 50px;
  list-style: none;
  margin-block-start: 0px;
  padding-inline-start: 0px;
`

const Button = styled.button`

`

const InputContainer = styled.ul`
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-block-start: 0px;
  padding-inline-start: 5px;
`

const InputInnerContainer = styled.div`
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: 30px 1fr;
`

interface ILabel {
  mb?: boolean
  lg?: boolean
}

const Label = styled.div<ILabel>`
  margin-bottom: ${({ mb }) => mb ? '10px' : undefined};
  font-size: ${({ lg }) => lg ? '1.5rem' : '1rem'};
`

const infos = [
  'glb 형식만 지원합니다.',
  'rotate: left mouse',
  'pan: ctrl + left mouse',
  'zoom: wheel',
]

function App() {
  const [inputUrl, setInputUrl] = useState<string | undefined>(undefined)
  const [currentBone, setCurrentBone] = useState<THREE.Bone | undefined>(undefined)
  const [currentBoneDataField, setCurrentBoneDataField] = useState<string>('matrix')
  const [currentBoneDataValues, setCurrentBoneDataValues] = useState<number[]>([])
  const [theSkeletonHelepr, setTheSkeletonHelper] = useState<THREE.SkeletonHelper | undefined>(undefined)

  const boneDataFields = {
    'matrix': currentBone?.matrix.elements,
    'matrixWorld': currentBone?.matrixWorld.elements,
    // 'modelViewMatrix': currentBone?.modelViewMatrix.elements,  // 개발자 도구로 해보니까 영향 안 줌
    // 'normalMatrix': currentBone?.normalMatrix.elements,
  }

  useRendering({ inputUrl, currentBone, setCurrentBone, setTheSkeletonHelper })

  useEffect(() => {
    if (currentBone) {
      console.log('currentBone: ', currentBone)
    }
    if (currentBone && currentBoneDataField === 'matrix') {
      console.log('currentBone.matrix: ', currentBone.matrix.elements)
    }
    if (currentBone && currentBoneDataField === 'matrixWorld') {
      console.log('currentBone.matrixWorld: ', currentBone.matrixWorld.elements)
    }
  }, [currentBone, currentBoneDataField])

  const handleFileChange = (event : any) => {
    if (!_.isEmpty(event.target.files)) {
      const file = event.target.files[0]
      const fileUrl = URL.createObjectURL(file)
      setInputUrl(fileUrl)
    }
  }

  const handleButtonClick = ({ event, field } : { event : any, field : string }) => {
    setCurrentBoneDataField(field)
    // @ts-ignore
    setCurrentBoneDataValues(boneDataFields[field])
  }

  const handleToggleAutoUpdate = () => {
    if (currentBone) {
      currentBone.matrixAutoUpdate = !currentBone.matrixAutoUpdate;
    }
  }

  const handleReversePositionX = () => {
    if (currentBone) {
      const { x, y, z } = currentBone.position
      console.log(x)
      currentBone.position.set(-x, y, z)
    }
  }

  const handleReversePositionY = () => {
    if (currentBone) {
      const { x, y, z } = currentBone.position
      currentBone.position.set(x, -y, z)
    }
  }

  const handleReversePositionZ = () => {
    if (currentBone) {
      const { x, y, z } = currentBone.position
      currentBone.position.set(x, y, -z)
    }
  }

  const handleReverseAllBonesPosition = () => {
    if (theSkeletonHelepr) {
      console.log('bones: ', theSkeletonHelepr.bones)
      theSkeletonHelepr.bones.forEach((bone, idx) => {
        if (idx === 0) {
          const { x, y, z, w } = bone.quaternion;
          // bone.position.set(0, 0, 0);
          bone.quaternion.set(-x, y, z, w)
        }
      })
    }
  }

  return (
    <>
      <Title>Retarget Sample</Title>
      <FileInputContainer>
        <FileInput
          type='file'
          accept='.glb'
          onChange={handleFileChange}
        />
        <InfoBoxContainer>
          {_.map(infos, (info, idx) => <InfoBox key={idx}>{info}</InfoBox>)}
        </InfoBoxContainer>
      </FileInputContainer>
      <MainContainer>
        <RenderingPanel id='renderingDiv' />
        <InputGroup>
          <BoneTitle>
            Current Bone: {currentBone?.name}
          </BoneTitle>
          <ButtonGroup>
            {_.map(Object.keys(boneDataFields), (field, idx) => (
            <Button
              key={idx}
              onClick={(event) => {
                handleButtonClick({ event, field })
              }}
            >
              {field}
            </Button>))}
            {currentBone && <Button onClick={handleToggleAutoUpdate}>Toggle AutoUpdate</Button>}
            <br />
            {currentBone && <Button onClick={handleReversePositionX}>Reverse X</Button>}
            {currentBone && <Button onClick={handleReversePositionY}>Reverse Y</Button>}
            {currentBone && <Button onClick={handleReversePositionZ}>Reverse Z</Button>}
            {theSkeletonHelepr && <Button onClick={handleReverseAllBonesPosition}>Reverse Bones</Button>}
          </ButtonGroup>
          <InputContainer>
            <Label mb lg>{currentBoneDataField}</Label>
            {_.map(currentBoneDataValues, (value, idx) => (
              <InputInnerContainer key={idx}>
                <Label key={`index-${idx}`}>
                  {idx}
                </Label>
                <Label key={`label-${idx}`}>
                  {value}
                </Label>
              </InputInnerContainer>
            ))}
          </InputContainer>
        </InputGroup>
      </MainContainer>
    </>
  );
}

export default React.memo(App);
