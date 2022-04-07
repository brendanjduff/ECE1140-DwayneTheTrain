import React, { useState } from 'react'
import Input from './Input'
import { Stack } from 'react-bootstrap'

export default function Form () {
  const [inputList, setInputList] = useState([])

  const onAddBtnClick = event => {
    setInputList(inputList.concat(<Input key={inputList.length} />))
  }

  const onDeleteBtnClick = event => {
    setInputList(inputList.remove(inputList.length - 1))
  }

  return (
    <div>
      <Stack direction='horizontal'>
        <button onClick={onAddBtnClick}>Add input</button>
        <button onClick={onDeleteBtnClick}>Delete input</button>
      </Stack>
      <Stack>{inputList}</Stack>
    </div>
  )
};
