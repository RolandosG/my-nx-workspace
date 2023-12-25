import React from 'react';
import Button from '@material-ui/core/Button';
import { useRecoilState } from 'recoil';
import { myAtom } from './stateAtoms';


const MyButton: React.FC = () => {
  const [value, setValue] = useRecoilState(myAtom);
  return (
    
    <><Button variant="contained" color="primary"></Button>
    <p>Value: {value}</p>
    <button onClick={() => setValue(value + 1)}>Increment</button></>
    
    

    
  );
};

export default MyButton;
