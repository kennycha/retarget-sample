import React, { useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import * as THREE from 'three';
import { useRendering } from 'hooks/useRendering';

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
  justify-content: center;
  margin-top: 30px;
`

const FileInput = styled.input`
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
  list-style: none;
  display: flex;
  flex-direction: column;
`

const BoneTitle = styled.div`
  height: 50px;
  font-size: 1.2rem;
`

const InputContainer = styled.ul`
  display: flex;
  justify-content: space-between;
  margin-block-start: 0px;
  padding-inline-start: 5px;
`

const Label = styled.label`

`

const Input = styled.input`
  margin-left: 10px;
`

const BONE_PROPERTIES = [
  'position', 'quaternion', 'scale'
]

function App() {
  const [inputUrl, setInputUrl] = useState<string | undefined>(undefined)
  const [currentBone, setCurrentBone] = useState<THREE.Bone | undefined>(undefined)

  useRendering({ inputUrl, currentBone, setCurrentBone })

  const handleFileChange = (event : any) => {
    if (!_.isEmpty(event.target.files)) {
      const file = event.target.files[0]
      const fileUrl = URL.createObjectURL(file)
      setInputUrl(fileUrl)
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
      </FileInputContainer>
      <MainContainer>
        <RenderingPanel id='renderingDiv' />
        <InputGroup>
          <BoneTitle>
            Current Bone: {currentBone?.name}
          </BoneTitle>
          {_.map(BONE_PROPERTIES, (property, idx) => (
          <InputContainer key={`container-${idx}`}>
            <Label key={`label-${idx}`}>{property}</Label>
            <Input
              key={`input-${idx}`} 
              
              />
          </InputContainer>))}
        </InputGroup>
      </MainContainer>
    </>
  );
}

export default App;
