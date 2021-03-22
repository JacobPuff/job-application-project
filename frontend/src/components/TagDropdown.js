import React, {useState} from 'react'
import {Tag} from './Tag'

export function TagDropdown(props) {
    const [textAdder, setTextAdder] = useState("")
    const HandleTagAdder = (e) => {
        if (e.key == "Enter" || e.keyCode == 13 || e.code == "Enter") {
            e.preventDefault()
            setTextAdder("")
            props.HandleTags(textAdder, props.FileNum)
        }
        if (e.target.value != textAdder){
            setTextAdder(e.target.value)
        }
    }

    const HandleButton = () => {
        setTextAdder("")
        props.HandleTags(textAdder, props.FileNum)
    }

    const HandleTagClick = (e, tag) => {
        e.preventDefault()
        props.HandleTags(tag, props.FileNum)
    }

    const GetTagListItems = () => {
        if (props.TagDataTagCounts == undefined || props.TagDataFileToTags == undefined ) {
            return
        }
        var listOfTagItems = []
        var count=0
        if (props.TagDataFileToTags[props.FileNum] != undefined) {
            for (const tag of props.TagDataFileToTags[props.FileNum]) {
                listOfTagItems.push(<li key={count} onClick={(e)=>{HandleTagClick(e, tag)}}>
                    <Tag Name={tag} Enabled={true}/>
                    </li>)
                count++
            }
        }

        for (const tag in props.TagDataTagCounts) {
            if (props.TagDataFileToTags[props.FileNum] && props.TagDataFileToTags[props.FileNum].includes(tag)) {
                continue
            }
            listOfTagItems.push(<li key={count} onClick={(e)=>{HandleTagClick(e, tag)}} style={{overflowWrap:"break-word"}}>
                <Tag Name={tag} Enabled={false}/>
                </li>)
            count++
        }
        return listOfTagItems
    }

    return <div className="btn-group dropdown dropstart">
        <button style={{padding: "5px"}} className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul className="dropdown-menu" style={{maxHeight: "500px", maxWidth: "400px", width: "max-content", overflowY:"scroll", wordBreak:"break-word"}}>
            <li>
                <input style={{width:"85%", display:"inline-block"}} type="text" className="form-control"
                    placeholder="Add Tag" value={textAdder} onChange={HandleTagAdder} onKeyDown={HandleTagAdder}  onClick={(e)=>{e.preventDefault()}} />
                <button style={{display:"inline-block", padding:"5px"}} type="button" className="btn btn-success" onClick={HandleButton}>+</button>
            </li>
            <li><hr className="dropdown-divider"/></li>
            {GetTagListItems()}
        </ul>
    </div>
}