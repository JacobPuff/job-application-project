import React, {useState} from 'react'
import {Tag} from './Tag'

export function TagDropdown(props) {
    const GetTagListItems = (props) => {
        return <div/>
    }

    return <div className="btn-group dropdown dropstart">
        <button style={{padding: "5px"}} className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul className="dropdown-menu" style={{height: "500px",overflowY:"scroll"}}>
            {GetTagListItems}
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <li>Test1</li>
            <li>Test2</li>
            <li>Test3</li>
            <span style={{margin:"0px"}}>
            <li><hr className="dropdown-divider"/></li>
            <input style={{width:"80%", display:"inline-block"}} type="text" className="form-control"
                placeholder="Add Tag"  onClick={(e)=>{e.preventDefault()}} onChange={()=>{}} onKeyDown={()=>{}}/>
            <button style={{display:"inline-block", padding:"5px"}} type="button" className="btn btn-success" onClick={()=>{}}>+</button>
            </span>
        </ul>
    </div>
}