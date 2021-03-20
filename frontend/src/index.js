import React from 'react';
import ReactDOM from 'react-dom';
import {Table} from './components/Table';

function App() {
    return (
        <div className="app border border-primary">
            <h4 className="title border-bottom border-3 border-primary">Medical Reports of Vitality</h4>
            <Table/>
        </div>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
)