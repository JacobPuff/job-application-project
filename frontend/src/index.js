import Table from './components/Table';

function App() {
    return (
        <div className="app border border-primary">
            <h4 className="title border-bottom border-3 border-primary">Hello World</h4>
            <Table/>
        </div>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
)