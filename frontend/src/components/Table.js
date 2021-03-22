import React, {useState, useEffect} from 'react';
import { DEFAULT_MAX_PER_PAGE, RELATIVE_PAGE_RANGE } from '../config';
import { TagDropdown } from './TagDropdown';

export function Table(props) {
    const EMPTY_PAGE = <tr key={-1}>
        <th scope="row">Not Found</th>
        <td>There doesn't seem to be anything here.</td>
        <td>Please try again later.</td>
        <td></td>
    </tr>
    const [data, setData] = useState(props.InitialData!=[]?props.InitialData:[])
    const [numOfPages, setNumOfPages] = useState(-1)
    const [page, setPage] = useState(-1)
    const [sortCollumn, setSortCollumn] = useState("fileNum")
    const [sortDir, setSortDir] = useState("down")

    useEffect(()=> {
        SortTableAndSetData(props.InitialData)
        var tempNumOfPages = Math.ceil(props.InitialData.length/DEFAULT_MAX_PER_PAGE)
        setNumOfPages(tempNumOfPages)
        if (props.InitialPageNum &&
            (props.InitialPageNum < 1 || (tempNumOfPages > 0 && props.InitialPageNum > tempNumOfPages))) {
            window.location = "/"
        }
        setPage(props.InitialPageNum?props.InitialPageNum:1)
        SortTableAndSetData(props.InitialData)
    }, [props])

    useEffect(()=>{
        SortTableAndSetData(data)
    }, [sortDir, sortCollumn])

    const SelectReport = (reportMetadata) => {
        props.SelectReport(reportMetadata, page)
    }

    const HandleTags = (tagName, fileNum) => {
        console.log(tagName, fileNum)
        props.ToggleTags(tagName, fileNum)
    }

    const GenerateTableRows = () => {
        var start = (page-1)*DEFAULT_MAX_PER_PAGE
        var end = start+DEFAULT_MAX_PER_PAGE
        if (data.length == 0) {
            return EMPTY_PAGE
        }
        return data.slice(start,end).map((d, i)=>
            <tr key={d.fileNum}>
                <th scope="row" onClick={()=>{SelectReport(d)}}>{d.fileNum}</th>
                <td onClick={()=>{SelectReport(d)}}>{d.title}<p className="text-muted">{d.subtitle}</p></td>
                <td onClick={()=>{SelectReport(d)}}>{d.author}</td>
                <td onClick={()=>{SelectReport(d)}}>{d.preview}</td>
                <td><TagDropdown FileNum={d.fileNum} TagData={props.TagData} HandleTags={HandleTags}/></td>
            </tr>)
    }
9 
    const GetPages = () => {
        var pagesAvailable = []
        var start = page - RELATIVE_PAGE_RANGE/2
        var end = page + RELATIVE_PAGE_RANGE/2

        if (numOfPages-page < RELATIVE_PAGE_RANGE/2) {
            start -= RELATIVE_PAGE_RANGE/2-(numOfPages-page)
        }
        if (page <= RELATIVE_PAGE_RANGE/2) {
            end += RELATIVE_PAGE_RANGE/2-(page-1)
        }

        // TODO: Make a component for easy duplication at the top of the page
        for (var i=start; i<=end; i++) {
            if (i >= 1 && i <= numOfPages) {
                pagesAvailable.push(
                    <li key={i} onClick={HandlePageSelection} className={`page-item page-secondary ${i==page?"active":""}`}>
                        <a className="page-link" pagenum={i}>{i}</a>
                    </li>
                )
            }
        }
        return pagesAvailable
    }
    const HandlePageSelection = (e) => {
        var pageNum = parseInt(e.target.attributes.pagenum.value, 10)
        history.pushState({data:data}, '', window.location.origin+"/?page="+pageNum)
        setPage(pageNum)
    }

    const GetSortIcon = (col) => {
        if (col == sortCollumn) {
            if (sortDir == "up") {
                //https://icons.getbootstrap.com/icons/arrow-up/
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                    </svg>
                )
            } else {
                //https://icons.getbootstrap.com/icons/arrow-down/
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                    </svg>
                )
            }
        }
        // https://icons.getbootstrap.com/icons/arrow-down-up/
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-up" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/>
            </svg>
        )
    }

    const HandleSetSort = (col) => {
        if (col == sortCollumn) {
            if (sortDir=="up") {
                setSortDir("down")
            } else {
                setSortDir("up")
            }
        } else {
            setSortCollumn(col)
            setSortDir("down")
        }
    }

    const SortTableAndSetData = (dataToSort) => {
        var newData = Array.from(dataToSort)
        newData.sort((a, b)=>{
            if (sortCollumn == "fileNum") {
                var aParsed = parseInt(a[sortCollumn], 10)
                var bParsed = parseInt(b[sortCollumn], 10)
                if (sortDir == "down") {
                    return aParsed < bParsed ? -1 : 1
                } else {
                    return bParsed < aParsed ? -1 : 1
                }

            }
            if (sortDir == "down") {
                return a[sortCollumn].localeCompare(b[sortCollumn])
            } else {
                return b[sortCollumn].localeCompare(a[sortCollumn])
            }
        })
        setData(newData)
    }

    return (
        <div style={{display: props.IsVisible?"":"none"}}>
            <table className="table table-hover table-striped" style={{padding:"10px"}}>
                <thead>
                    <tr>
                        <th scope="col" width="7%">
                            File Num
                            <span style={{paddingLeft:"5px"}} onClick={()=>{HandleSetSort("fileNum")}}>
                                {GetSortIcon("fileNum")}
                            </span>
                        </th>
                        <th scope="col" width="30%">
                            "Report" Title
                            <span style={{paddingLeft:"5px"}} onClick={()=>{HandleSetSort("title")}}>
                                {GetSortIcon("title")}
                            </span>
                        </th>
                        <th scope="col" width="20%">
                            Author
                            <span style={{paddingLeft:"5px"}} onClick={()=>{HandleSetSort("author")}}>
                                {GetSortIcon("author")}
                            </span>
                        </th>
                        <th scope="col" width="41%">
                            Preview
                        </th>
                        <th scope="col" width="2%"></th>
                    </tr>
                </thead>
                <tbody>
                    {GenerateTableRows()}
                </tbody>
            </table>
            <nav >
                <ul className="pagination">
                    <li className={`page-item ${page==1?"disabled":""}`}>
                        <a className="page-link" pagenum={`${page-1}`} onClick={HandlePageSelection} aria-disabled={page==1?"true":"false"}>Previous</a>
                    </li>
                    {GetPages()}
                    <li className={`page-item ${page==numOfPages?"disabled":""}`}>
                        <a className="page-link" pagenum={`${page+1}`} onClick={HandlePageSelection} aria-disabled={page==numOfPages?"true":"false"}>Next</a>
                    </li>
                </ul>
            </nav>
        </div>
    )
}