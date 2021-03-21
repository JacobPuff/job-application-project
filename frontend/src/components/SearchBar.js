import React, {useState} from 'react'

export function SearchBar(props) {
    const [searchText, setSearchText] = useState("")

    const HandleChange = (e) => {
        if (e.key == "Enter" || e.keyCode == 13 || e.code == "Enter") {
            e.preventDefault()
            SubmitSearch()
        }
        if (e.target.value != searchText){
            setSearchText(e.target.value)
        }
    }

    const SubmitSearch = () => {
        props.DoSearch(searchText)
    }

    return <div style={props.style}>
        <input style={{width:"80%", display:"inline-block"}} type="text" className="form-control"
            placeholder="Search" value={searchText} onChange={HandleChange} onKeyDown={HandleChange}/>
        <button style={{display:"inline-block"}} type="button" className="btn btn-primary" onClick={SubmitSearch}>Submit</button>
    </div>
}