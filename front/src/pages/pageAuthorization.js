import { useState } from "react"
import { useSelector, useDispatch } from 'react-redux'
import {history} from "../layout/index"
import { actionEnter, actionLogin } from "../store/actions"
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export  const PageAuthorization = () => {
const [name, setName] = useState("")
const [password, setPassword] = useState("")
const counter = useSelector((state) => state)
const dispatch = useDispatch()
const handleClick = () => {
  
  dispatch(actionEnter(name,password))
  console.log(localStorage.getItem('authToken'))
  
}

return <>
<div className="card">
      <div className="cardHeader">Login</div>
      <div className="cardBody">
        <div className="inputGroup">
          <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="name"
          label="Name"
          name="name"
          autoFocus
          value = {name}
          onChange= {e => setName(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange = {e => setPassword(e.target.value)}
          />
        </div>
        <button 
        onClick={()=>handleClick()}
        disabled={(!name) || (!password)}
        >Login</button>
        <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={()=>handleClick()}
        disabled={(!name) || (!password)}
          >
            Sign In
          </Button>
      </div>
    </div>
</>}