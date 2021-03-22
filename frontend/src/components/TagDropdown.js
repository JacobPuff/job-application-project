import React, {useState} from 'react'
import {Tag} from './Tag'

export function TagDropdown(props) {
    const GetTagListItems = () => {
        console.log("Dropdown", props.FileNum)
        if (props.TagData.tagCounts == undefined || props.TagData.fileToTags == undefined ) {
            return
        }
        var listOfTagItems = []
        var count=0
        if (props.TagData.fileToTags[props.FileNum] != undefined) {
            for (const tag of props.TagData.fileToTags[props.FileNum]) {
                listOfTagItems.push(<li key={count} onClick={()=>{props.HandleTags(tag, props.FileNum)}}>
                    <Tag Name={tag} Enabled={true}/>
                    </li>)
                count++
            }
        }

        for (const tag in props.TagData.tagCounts) {
            if (props.TagData.fileToTags[props.FileNum] && props.TagData.fileToTags[props.FileNum].includes(tag)) {
                continue
            }
            listOfTagItems.push(<li key={count} onClick={()=>{props.HandleTags(tag, props.FileNum)}}>
                <Tag Name={tag} Enabled={false}/>
                </li>)
            count++
        }
        return listOfTagItems
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