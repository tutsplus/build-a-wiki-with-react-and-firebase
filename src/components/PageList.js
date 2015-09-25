import React from 'react';
import * as API from '../api';

import {Link} from 'react-router';

export default class PageList extends React.Component {
    state = {
        loaded: false,
        pages: {},
        newPageTitle: '' 
    }

    constructor (props, context) {
        super(props, context)
        this.context = context;
    }

    componentDidMount() {
        API.pages.on('value', ss => this.setState({
            pages: ss.exportVal() || {},
            loaded: true
        }));
    }
    render () {
        let items = this.state.loaded ? Object.keys(this.state.pages).map(id => <li key={id}> 
            <Link to='page' params={ { id: id } }> {this.state.pages[id].title} </Link>
        </li>) :
            [<li key='loading'> <em> Loading... </em> </li>];

        return <div>
            <ul> {items} </ul>
            { this.props.user ? 
                <input type='text' 
                        className='u-full-width'
                        value={this.state.newPageTitle}
                        placeholder='New Page Title'
                        onChange={this.update} 
                        onKeyPress={this.createPage}/> :
                        null
            }
        </div>;
    }

    update = evt => this.setState({ newPageTitle: evt.target.value });
    createPage = evt => {
        if (evt.charCode !== 13) return;
        var id = API.pages.push({ title: this.state.newPageTitle });
        this.context.router.transitionTo('page', { id: id.key() });
        this.setState({ newPageTitle: '' });
    }
}

PageList.contextTypes = {
    router: React.PropTypes.func.isRequired
};
