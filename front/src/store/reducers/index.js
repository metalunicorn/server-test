import jwt_decode from "jwt-decode";

function authReducer(state, action) { 
    if (state === undefined) {
        if (localStorage.authToken) {
            action.type = 'LOGIN'
        }
        else {
            return {}

        }
    }
    if (action.type === 'LOGIN') {

        if (action.jwt) {
            localStorage.authToken = action.jwt
            return { token: action.jwt, payload: jwt_decode(action.jwt), login: true }
        }
        return { token: localStorage.authToken, payload: jwt_decode(localStorage.authToken), login: true }
    }
    if (action.type === 'LOGOUT') {
        
        localStorage.removeItem('authToken')
        return {}
    }
    if (action.type === 'IN'){
        console.log(action)
        return {login: action.login, password: action.password}
    }
    return state
   
}

export {authReducer}