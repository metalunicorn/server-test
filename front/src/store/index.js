import { createStore, applyMiddleware, combineReducers } from 'redux';
import {authReducer} from "./reducers";
import thunk from 'redux-thunk';


let store = createStore(combineReducers({
    login: authReducer
}), applyMiddleware(thunk))


// store.subscribe(()=> console.log(store.getState()))
export { store };