import React, {useState} from 'react'
import {Tag} from './Tag'

export function TagDropdown(props) {
    const GetTagListItems = () => {
        var listOfEnabledTagItems = []
        var listOfDisabledTagItems = []
        for (const test in props.TagData.tagCounts) {
            listOfEnabledTagItems.push(<li><Tag Name={test} Enabled={true}/></li>)
        }
        for (const test in props.TagData.tagCounts) {
            listOfEnabledTagItems.push(<li><Tag Name={test} Enabled={false}/></li>)
        }
        return listOfEnabledTagItems
    }

    return <div className="btn-group dropdown dropstart">
        <button style={{padding: "5px"}} className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul className="dropdown-menu" style={{maxHeight: "500px",overflowY:"scroll"}}>
            <li>
                <input style={{width:"80%", display:"inline-block"}} type="text" className="form-control"
                    placeholder="Add Tag"  onClick={(e)=>{e.preventDefault()}} onChange={()=>{}} onKeyDown={()=>{}}/>
                <button style={{display:"inline-block", padding:"5px"}} type="button" className="btn btn-success" onClick={()=>{}}>+</button>
            </li>
            <li><hr className="dropdown-divider"/></li>
            {GetTagListItems()}
        </ul>
    </div>
}